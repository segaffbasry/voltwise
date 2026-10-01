#!/bin/sh
# Self-hosts the two families voltwisepower.com loads in its Webflow CSS (vsnry-voltwise.webflow.shared.css):
#   @font-face "Overpass Custom Font"   → Overpass-VariableFont_wght.ttf (wght 100–900), UI and body
#   @font-face "Anek Latin Custom Font" → AnekLatin-VariableFont_wdth,wght.ttf (wght 100–800), display
# Both are SIL OFL. They are subset to Latin and converted to woff2 with fontTools (pip install fonttools brotli).
set -e
cd "$(dirname "$0")/.."
CDN=https://cdn.prod.website-files.com/668c036148605ed643d1c4f3
TMP=_scrape/fonts; mkdir -p "$TMP" public/fonts
curl -sL "$CDN/66d89f732e26f375b4319e7e_Overpass-VariableFont_wght.ttf" -o "$TMP/overpass.ttf"
curl -sL "$CDN/66d89f2cba6c9214da16e2c4_AnekLatin-VariableFont_wdth%2Cwght.ttf" -o "$TMP/anek.ttf"
U="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212"
for f in overpass anek; do
  python3 -m fontTools.subset "$TMP/$f.ttf" --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file="public/fonts/$f.woff2"
done
ls -la public/fonts
