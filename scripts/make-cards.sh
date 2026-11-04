#!/usr/bin/env bash
# Makes a uniform 600x800 portrait version of every exhibit picture in public/cards/.
# Each picture is fitted inside the frame with an even margin on a fixed background,
# so every room card shows the same shape and size. Run again after adding pictures.
set -euo pipefail
cd "$(dirname "$0")/.."
BG='#ece8dc'
grep -ho '^  src: "/images/[^"]*"' src/content/exhibits/*.md | sed 's/.*"\(\/images\/[^"]*\)"/\1/' | sort -u | while read -r src; do
  in="public${src}"
  out="public/cards/$(basename "$src" | sed 's/\.[^.]*$/.jpg/')"
  if [ ! -f "$in" ]; then echo "missing: $in"; continue; fi
  convert "$in" -strip -resize 540x740 -background "$BG" -gravity center -extent 600x800 -alpha remove -alpha off -quality 82 -interlace Plane "$out"
done
echo "cards: $(ls public/cards | wc -l)"
