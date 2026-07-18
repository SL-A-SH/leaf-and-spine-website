#!/usr/bin/env bash
# Leaf & Spine — bake the film into a scroll-scrub frame sequence.
# Expects assets/clip1.mp4 … clip5.mp4 next to this repo root.
# Produces: frames/f_0001.jpg…, frames/manifest.js, assets/trailer.mp4, assets/poster.jpg
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for i in 1 2 3 4 5; do
  [ -f "assets/clip$i.mp4" ] || { echo "missing assets/clip$i.mp4"; exit 1; }
done

FPS=12
WIDTH=1536
Q=4

rm -f frames/f_*.jpg
mkdir -p frames assets

# concat list
LIST=$(mktemp)
for i in 1 2 3 4 5; do echo "file '$ROOT/assets/clip$i.mp4'" >> "$LIST"; done

# trailer (single continuous film, stream-copied — all clips share codec params)
ffmpeg -y -f concat -safe 0 -i "$LIST" -an -c copy -movflags +faststart assets/trailer.mp4

# poster
ffmpeg -y -i assets/trailer.mp4 -frames:v 1 -q:v 3 assets/poster.jpg

# frame sequence
ffmpeg -y -i assets/trailer.mp4 -vf "fps=$FPS,scale=$WIDTH:-2" -q:v $Q frames/f_%04d.jpg

COUNT=$(ls frames/f_*.jpg | wc -l | tr -d ' ')
cat > frames/manifest.js <<EOF
window.FRAMES = { count: $COUNT, prefix: "f_", fps: $FPS };
EOF

SIZE=$(du -sh frames | cut -f1)
echo "Baked $COUNT frames ($SIZE) + trailer + poster."
