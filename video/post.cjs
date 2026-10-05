"use strict";

// Derived from ~/tools/demo-recorder/lib/post.js. Local fixes: per-frame zoom, weighted pan, VO cache, captions, and duration gate.
// Post phase: TTS per scene → freeze-pad clips to VO length → concat → burn captions.
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const sh = (bin, args) => execFileSync(bin, args, { stdio: ["ignore", "pipe", "inherit"] });
const probe = (f) => parseFloat(execFileSync("ffprobe",
  ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

function tts(text, outFile, voice) {
  const stamp = outFile + ".json";
  const key = JSON.stringify({text,voice});
  if (fs.existsSync(outFile) && fs.existsSync(stamp) && fs.readFileSync(stamp, "utf8") === key) return;
  sh("edge-tts", ["--voice", voice, "--text", text, "--write-media", outFile]);
  fs.writeFileSync(stamp,key);
}

// ASS captions, PlayRes fixed to the render size so font metrics are predictable.
function buildAss(cues, outFile, { width, height }) {
  const ts = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h}:${String(m).padStart(2, "0")}:${sec.toFixed(2).padStart(5, "0")}`;
  };
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,DejaVu Sans,44,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,3,1,2,60,60,54,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const evs = cues.map((c) =>
    `Dialogue: 0,${ts(c.start)},${ts(c.end)},Cap,,0,0,0,,${c.text.replace(/\n/g, "\\N")}`);
  fs.writeFileSync(outFile, header + evs.join("\n") + "\n");
}

// Build an animated crop that zooms toward each logged focus point.
// focus = [{t, x, y}] in scene-local seconds. zoom 1→Z, hold, ease out;
// overlapping windows blend positions → smooth pan between focus points.
function zoomFilter(m, width, height, Z = 1.55) {
  const F = m.focus;
  if (!F || !F.length) return null;
  const RU = 0.4, HOLD = 4, RD = 0.45;
  const s = F.map((f, i) => {
    const up0 = (f.t - 0.35).toFixed(2), up1 = (f.t + 0.05).toFixed(2);
    const next = F[i + 1];
    const holdEnd = next ? Math.max(f.t + HOLD, next.t - 0.35).toFixed(2)
                         : (f.t + HOLD).toFixed(2);
    const dn1 = (+holdEnd + RD).toFixed(2);
    return `if(lt(t,${up0}),0,if(lt(t,${up1}),(t-${up0})/${RU},if(lt(t,${holdEnd}),1,if(lt(t,${dn1}),1-(t-${holdEnd})/${RD},0))))`;
  });
  // crop width/height are evaluated once. zoompan evaluates zoom on every frame.
  const weights = s.map(w => w.replace(/\bt\b/g, '(on/30)'));
  const total = `(${weights.join("+")})`;
  const S = `min(1,${total})`;
  const center = (axis, fallback) => {
    const sum = F.map((f,i) => `(${f[axis]}*${weights[i]})`).join('+');
    const target = `(${sum})/max(.001,${total})`;
    return `(${fallback}*(1-${S})+(${target})*${S})`;
  };
  const cx = center('x',width/2), cy = center('y',height/2);
  return `fps=30,zoompan=z='1+${Z-1}*${S}'` +
    `:x='min(max(${cx}-iw/zoom/2,0),iw-iw/zoom)'` +
    `:y='min(max(${cy}-ih/zoom/2,0),ih-ih/zoom)'` +
    `:d=1:s=${width}x${height}:fps=30`;

}

// Split a long caption into ≤2-line cues (~90 chars each), sentence-first,
// timed proportionally inside the scene's window.
function chunkCue(start, end, text) {
  const MAX = 90;
  if (text.length <= MAX) return [{ start, end, text }];
  const parts = text.match(/[^.!?;—]+[.!?;—]?\s*/g) || [text];
  // over-long sentence parts get a second split at word boundaries
  const segs = [];
  for (const p of parts) {
    let rest = p.trim();
    while (rest.length > MAX) {
      let cut = rest.lastIndexOf(" ", MAX);
      if (cut < 20) cut = MAX;
      segs.push(rest.slice(0, cut)); rest = rest.slice(cut);
    }
    if (rest) segs.push(rest);
  }
  const chunks = []; let cur = "";
  for (const p of segs) {
    if ((cur + " " + p).trim().length > MAX && cur) { chunks.push(cur); cur = p; }
    else cur = cur ? cur + " " + p : p;
  }
  if (cur.trim()) chunks.push(cur.trim());
  const total = chunks.reduce((s, c) => s + c.length, 0);
  let t = start;
  return chunks.map((text) => {
    const dur = (end - start) * (text.length / total);
    const c = { start: t, end: Math.min(end, t + dur), text };
    t += dur; return c;
  });
}

async function post(scenes, manifest, opts) {
  const { outDir, width = 1920, height = 1080, voice = "en-US-ChristopherNeural",
    pad = 0.35, tailPad = 0.5 } = opts;
  const segDir = path.join(outDir, "segs");
  fs.mkdirSync(segDir, { recursive: true });

  const segs = [];
  const cues = [];
  let offset = 0;
  const timing = [];

  for (const m of manifest) {
    if (m.error) continue;
    const i = m.idx;
    const scene = scenes[i];
    // session scenes are sub-ranges of one shared video
    const clipDur = m.range ? m.range[1] - m.range[0] : probe(m.file);
    let voFile = null, voDur = 0;

    if (scene.vo) {
      voFile = path.join(segDir, `vo-${String(i).padStart(2, "0")}.mp3`);
      tts(scene.vo, voFile, scene.voice || voice);
      voDur = probe(voFile);
    }

    const last = manifest[manifest.length - 1] === m;
    // recordVideo drops idle frames — static card clips come out shorter than
    // the requested hold, so honor scene.duration as a floor too.
    // scene.pause = extra beat of silence after the VO (pacing control).
    const target = Math.max(clipDur, scene.duration || 0,
      voDur ? voDur + tailPad : 0) + (voDur ? 0 : pad) + (scene.pause || 0);
    const vPad = Math.max(0, target - clipDur);
    const segOut = path.join(segDir, `seg-${String(i).padStart(2, "0")}.mp4`);

    const zoom = opts.zoom === false ? null : zoomFilter(m, width, height);
    const vFilter =
      (m.range ? `trim=start=${m.range[0]}:end=${m.range[1]},setpts=PTS-STARTPTS,` : "") +
      (vPad > 0.05 ? `tpad=stop=-1:stop_mode=clone:stop_duration=${vPad.toFixed(2)},` : "") +
      (zoom ? zoom + "," : `scale=${width}:${height},`) +
      `fps=30,format=yuv420p`;
    const aFilter = `aresample=48000,apad=whole_dur=${target.toFixed(2)},atrim=0:${target.toFixed(2)}`;

    const args = ["-y", "-i", m.file];
    if (voFile) args.push("-i", voFile);
    else args.push("-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono");
    args.push("-filter_complex", `[0:v]${vFilter}[v];[1:a]${aFilter}[a]`,
      "-map", "[v]", "-map", "[a]", "-t", target.toFixed(2),
      "-c:v", "libx264", "-preset", "fast", "-c:a", "aac", "-b:a", "128k", segOut);
    sh("ffmpeg", args);
    segs.push(segOut);

    const cap = scene.caption || scene.vo;
    if (cap) cues.push(...chunkCue(offset + 0.15, offset + target - 0.1, cap));
    timing.push({name:scene.name,start:offset,end:offset+target,duration:target,voiceDuration:voDur,clipDuration:clipDur});
    offset += target;
    opts.log(`  ${scene.name}: clip ${clipDur.toFixed(1)}s + vo ${voDur.toFixed(1)}s → ${target.toFixed(1)}s${vPad > 0.05 ? " (freeze-pad)" : ""}`);
  }

  fs.writeFileSync(path.join(outDir, "timing.json"),JSON.stringify(timing,null,2));
  if (offset < 120 || offset > 180) throw new Error(`Submission video must be 120–180 seconds, got ${offset.toFixed(1)}`);
  const list = path.join(outDir, "concat.txt");
  fs.writeFileSync(list, segs.map((f) => `file '${f}'`).join("\n"));
  const base = path.join(outDir, "base.mp4");
  sh("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", base]);

  const ass = path.join(outDir, "captions.ass");
  buildAss(cues, ass, { width, height });
  const final = opts.outFile || path.join(outDir, "demo.mp4");
  sh("ffmpeg", ["-y", "-i", base, "-vf", `subtitles=${ass.replace(/\\/g, "\\\\").replace(/:/g, "\\:")}`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-c:a", "aac", "-b:a", "160k", final]);
  opts.log(`\n  done → ${final} (${offset.toFixed(1)}s total)`);
  return final;
}

module.exports = { post };
