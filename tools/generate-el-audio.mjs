// Generate trailer music + voiceover via ElevenLabs.
// Run from the project root:  node tools/generate-el-audio.mjs
// Reads ELEVENLABS_API_KEY from .env.local — the key never leaves this machine.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envText = readFileSync(join(root, ".env.local"), "utf8");
const KEY = (envText.match(/ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)"?/) || [])[1];
if (!KEY) { console.error("ELEVENLABS_API_KEY not found in .env.local"); process.exit(1); }

const outDir = join(root, "assets", "el");
mkdirSync(outDir, { recursive: true });

const H = { "xi-api-key": KEY, "Content-Type": "application/json" };

async function save(name, res) {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${name}: HTTP ${res.status} — ${body.slice(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(outDir, name), buf);
  console.log(`✓ ${name}  (${(buf.length / 1024).toFixed(0)} KB)`);
}

// ---------- 1. music (Eleven Music) ----------
async function music() {
  console.log("Generating music…");
  const res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST", headers: H,
    body: JSON.stringify({
      prompt: "Warm, calm, deeply relaxing cinematic ambient music for a cozy reading-app trailer. Soft felt piano, warm strings, gentle airy pads. Slow, serene, intimate library at night; hopeful and cozy. No drums, no vocals. Builds very gently and resolves peacefully at the end.",
      music_length_ms: 45200,
    }),
  });
  await save("music.mp3", res);
}

// ---------- 2. voiceover ----------
const VOICE = "JBFqnCBsd6RMkjVDRZzb"; // George — warm narration
const LINES = [
  ["vo1.mp3", "Transform your reading."],
  ["vo2.mp3", "Build your sanctuary."],
  ["vo3.mp3", "Read in beautiful environments, with ambient music and sounds."],
  ["vo4.mp3", "Highlight, take notes, and build a daily reading habit."],
  ["vo5.mp3", "Privacy focused. No account required."],
  ["vo6.mp3", "Download Leaf and Spine today."],
];
async function voiceover() {
  for (const [file, text] of LINES) {
    console.log(`Narrating: ${text}`);
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
      {
        method: "POST", headers: H,
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.25 },
        }),
      }
    );
    await save(file, res);
  }
}

try {
  await music();
} catch (e) {
  console.error("Music generation failed (plan may not include Eleven Music):\n " + e.message);
}
try {
  await voiceover();
  console.log("\nAll done — files in assets/el/");
} catch (e) {
  console.error("Voiceover failed:\n " + e.message);
  process.exit(1);
}
