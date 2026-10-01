#!/bin/sh
# Downloads every image and film the homepage uses from voltwisepower.com's Webflow CDN and prepares local copies.
# Sources: the live homepage (/), plus /about for the two photos that join the hero collage. Requires curl + ffmpeg.
#
# Grade ("photography stays inside the palette"): photographs get a light shared grade, saturation 0.86 and shadows
# nudged toward Green, so the orange of hi-vis vests and sunsets sits back. Branded graphics (news slides) are untouched.
set -e
cd "$(dirname "$0")/.."
RAW=_scrape/raw; OUT=public/media; mkdir -p "$RAW" "$OUT"
C=https://cdn.prod.website-files.com/668c036148605ed643d1c4f3
C4=https://cdn.prod.website-files.com/668c036148605ed643d1c4f4
get() { [ -s "$RAW/$2" ] || curl -sL "$1" -o "$RAW/$2"; }

# Brand
get "$C/668c036148605ed643d1c54a_Voltwise%20White%20Logo.svg" logo-white.svg
get "$C/668c036148605ed643d1c56d_Sandbook.svg" sandbrook.svg
# Films (homepage hero + "Accelerating net zero")
get "$C/668c036148605ed643d1c585_VWP_WebHeader_Online_v002_1000x1094px.mp4" hero.mp4
get "https://cdn.prod.website-files.com/666198d55b43756f80977f2c%2F6672949ff98af825e3caed1d_VWP_WebHeader_Online_v002_1000x1094px-poster-00001.jpg" hero-poster.jpg
get "$C/668c036148605ed643d1c5a5_Voltwise%20Expert%20Renewable%20Energy%20Engineers%20Walking%20to%20Energy%20Storage%20System_-transcode.mp4" engineers.mp4
# Photographs
get "$C/668c036148605ed643d1c58e_Voltwise%20energy%20storage%20containers%20(BESS)%20with%20solar%20and%20wind%20turbines%20in%20nature%201%20(1)-min.webp" bess-nature.webp
get "$C/668c036148605ed643d1c5a0_GettyImages-852092910%201%20(2)-min.avif" getty.avif
get "$C/668c036148605ed643d1c590_Voltwise%20Power%20Battery%20Energy%20Storage%20System%20Winning%20Strategy%20Top%20Company%201.avif" about-strategy.avif
# News (the live homepage's "Latest news" feed, newest first)
get "$C4/69e15f777593795e0775b6a2_20250416%20-%20Voltwise%20Press%20Release%20-%20Interim%20CEO.avif" news-1.avif
get "$C4/6977546365f2146a4501a0ad_Voltwise%20Power%20-%20Leading%20Battery%20Energy%20Storage%20System%20(BESS)%20Business.avif" news-2.avif
get "$C4/68e5830f8837d99ac92bfcc1_Screenshot%202025-10-07%20at%2022.15.51.avif" news-3.avif
get "$C4/6853f04f45554dc5688dc285_WhatsApp%20Image%202025-06-19%20at%2013.52.43_713019d2.avif" news-4.avif
get "$C4/66f6c4e43d041e015fac950d_Voltwise%20acquires%20BESS%20battery%20storage%20project%20in%20North%20Rhine-Westphalia%20Germany%20.avif" news-5.avif

GRADE="eq=saturation=0.86,colorbalance=rs=-0.03:gs=0.03:bs=-0.01"
photo() { ffmpeg -v error -y -i "$RAW/$1" -vf "scale='min($3,iw)':-2,$GRADE" -q:v 3 "$OUT/$2"; }
plain() { ffmpeg -v error -y -i "$RAW/$1" -vf "scale='min($3,iw)':-2" -q:v 3 "$OUT/$2"; }

photo bess-nature.webp bess-nature.jpg 2400
photo getty.avif offshore.jpg 2000
photo about-strategy.avif field-engineer.jpg 900
photo news-2.avif bess-units.jpg 1400
photo news-4.avif site-team.jpg 1400
photo news-5.avif bess-row.jpg 1400
# The live poster JPG is only 658px wide, so the poster is the film's own first frame at full width instead.
ffmpeg -v error -y -i "$RAW/hero.mp4" -frames:v 1 -vf "$GRADE" -q:v 3 "$OUT/hero-poster.jpg"
plain news-1.avif news-leadership-change.jpg 1200
plain news-3.avif news-cfo.jpg 1200
cp "$OUT/bess-units.jpg" "$OUT/news-financing.jpg"
cp "$OUT/site-team.jpg" "$OUT/news-sms.jpg"

# Films: muted H.264, no audio track, faststart, the same grade as the stills.
ffmpeg -v error -y -i "$RAW/hero.mp4" -an -vf "$GRADE" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUT/hero.mp4"
ffmpeg -v error -y -i "$RAW/engineers.mp4" -an -vf "$GRADE" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUT/engineers.mp4"
ffmpeg -v error -y -ss 1 -i "$RAW/engineers.mp4" -frames:v 1 -vf "$GRADE" -q:v 3 "$OUT/engineers-poster.jpg"
cp "$RAW/sandbrook.svg" "$OUT/sandbrook.svg"
ls -la "$OUT"
