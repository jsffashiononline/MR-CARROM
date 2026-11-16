from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math
root = Path("android/app/src/main/res")
root.mkdir(parents=True, exist_ok=True)
S = 864
im = Image.new("RGBA", (S,S), (0,0,0,0))
d = ImageDraw.Draw(im)
# Gold circular rim and subtle inner medallion
d.ellipse((70,70,S-70,S-70), fill=(12,22,42,255), outline=(216,173,81,255), width=16)
d.ellipse((112,112,S-112,S-112), outline=(255,240,189,230), width=5)
gold=(232,190,91,255); cream=(255,240,189,255)
# Growth bars
for x,y,w,h in [(250,430,76,170),(394,300,76,300),(538,205,76,395)]:
    d.rounded_rectangle((x,y,x+w,y+h), radius=18, fill=gold)
# Rising trend arrow
d.line([(220,330),(345,250),(455,278),(630,130)], fill=cream, width=22, joint="curve")
d.line([(565,130),(630,130),(630,195)], fill=cream, width=22)
try:
    font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 90)
except:
    font=ImageFont.load_default()
bbox=d.textbbox((0,0),"M.R",font=font)
d.text(((S-(bbox[2]-bbox[0]))/2,650),"M.R",font=font,fill=cream,stroke_width=1)
# Legacy launcher icons
for name,size in [("mdpi",48),("hdpi",72),("xhdpi",96),("xxhdpi",144),("xxxhdpi",192)]:
    folder=root/f"mipmap-{name}"; folder.mkdir(parents=True,exist_ok=True)
    im.resize((size*4,size*4),Image.Resampling.LANCZOS).resize((size,size),Image.Resampling.LANCZOS).save(folder/"ic_launcher.png")
# Adaptive icon foreground is transparent, padded artwork
fg=Image.new("RGBA",(432,432),(0,0,0,0))
art=im.resize((302,302),Image.Resampling.LANCZOS)
fg.alpha_composite(art,(65,65))
folder=root/"drawable-nodpi"; folder.mkdir(parents=True,exist_ok=True)
fg.save(folder/"ic_launcher_foreground.png")
folder=root/"mipmap-anydpi-v26"; folder.mkdir(parents=True,exist_ok=True)
(folder/"ic_launcher.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@drawable/ic_launcher_foreground"/>\n</adaptive-icon>\n''')
folder=root/"values"; folder.mkdir(parents=True,exist_ok=True)
(folder/"ic_launcher_background.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="ic_launcher_background">#080F20</color></resources>\n''')
