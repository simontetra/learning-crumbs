#!/usr/bin/env bash
# Add (or replace) an exhibit's picture, then build, commit and push.
#
#   scripts/publish-image.sh <slug>
#
# Reads scripts/pending/<slug>.json, written beforehand:
#   { "source": "/path/to/upload.jpg",
#     "crop": "WxH+X+Y"            (optional, in original pixels),
#     "width": 1400                (optional),
#     "image": { "alt": "...", "credit": "...", "licence": "...", "url": "...",
#                "licenceUrl": "...", "fit": "contain" }   (licenceUrl, fit optional),
#     "message": "commit message" }
set -euo pipefail
cd "$(dirname "$0")/.."
slug="$1"
spec="scripts/pending/$slug.json"
[ -f "$spec" ] || { echo "No $spec"; exit 1; }

python3 - "$slug" "$spec" <<'PY'
import json, re, subprocess, sys
slug, spec = sys.argv[1], sys.argv[2]
d = json.load(open(spec))
out = f"public/images/{slug}.jpg"
cmd = ["convert", d["source"]]
if d.get("crop"):
    cmd += ["-crop", d["crop"], "+repage"]
cmd += ["-strip", "-resize", f'{d.get("width", 1400)}x>', "-quality", "82", "-interlace", "Plane", out]
subprocess.run(cmd, check=True)

im = d["image"]
def q(s): return json.dumps(s, ensure_ascii=False)
block = "image:\n" + f'  src: "/images/{slug}.jpg"\n'
for k in ["alt", "credit", "licence", "url", "licenceUrl", "fit"]:
    if im.get(k):
        block += f"  {k}: {im[k] if k == 'fit' else q(im[k])}\n"

p = f"src/content/exhibits/{slug}.md"
s = open(p).read()
head, rest = s.split("---", 2)[1], s.split("---", 2)[2]
if re.search(r"^image:\n(  .*\n)+", head, re.M):
    head = re.sub(r"^image:\n(  .*\n)+", block, head, count=1, flags=re.M)
elif re.search(r"^imageToFind:.*\n", head, re.M):
    head = re.sub(r"^imageToFind:.*\n", block, head, count=1, flags=re.M)
else:
    head = head.replace("\npebbles:", "\n" + block.rstrip("\n") + "\npebbles:", 1)
open(p, "w").write("---" + head + "---" + rest)
print("updated", p)
PY

npm run build --silent >/dev/null 2>&1 || { npm run build; exit 1; }
msg=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('message','Add picture to $slug'))" "$spec")
rm -f "$spec"
git add -A
git -c user.name="Simon Dale" -c user.email="simoncharlesdale@gmail.com" commit -q -m "$msg

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018Q6vReihbTa9XHuFCszjGn"
git push -q origin main
git log --oneline -1
