from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

root = Path("android/app/src/main/res")
S = 864
im = Image.new("RGBA", (S, S), (8, 15, 32, 255))
d = ImageDraw.Draw(im)
# Premium navy medallion with a thin gold double ring
d.ellipse((58, 58, S-58, S-58), fill=(12, 22, 42, 255), outline=(216, 173, 81, 255), width=18)
d.ellipse((91, 91, S-91, S-91), outline=(255, 240, 189, 190), width=5)
# The only logo text: JSF
font_paths = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"
]
font = None
for path in font_paths:
    try:
        font = ImageFont.truetype(path, 222)
        break
    except OSError:
        pass
if font is None:
    font = ImageFont.load_default()
word = "JSF"
bbox = d.textbbox((0, 0), word, font=font, stroke_width=1)
x = (S - (bbox[2] - bbox[0])) / 2 - bbox[0]
y = (S - (bbox[3] - bbox[1])) / 2 - bbox[1] - 5
d.text((x, y), word, font=font, fill=(255, 230, 160, 255), stroke_width=2, stroke_fill=(181, 125, 35, 255))

# Standard Android launcher icon sizes
for name, size in [("mdpi",48),("hdpi",72),("xhdpi",96),("xxhdpi",144),("xxxhdpi",192)]:
    folder = root / f"mipmap-{name}"
    folder.mkdir(parents=True, exist_ok=True)
    im.resize((size, size), Image.Resampling.LANCZOS).save(folder / "ic_launcher.png")

# Adaptive icon foreground: transparent with artwork safely inset
fg = Image.new("RGBA", (432, 432), (0, 0, 0, 0))
art = im.resize((302, 302), Image.Resampling.LANCZOS)
fg.alpha_composite(art, (65, 65))
folder = root / "drawable-nodpi"
folder.mkdir(parents=True, exist_ok=True)
fg.save(folder / "jsf_launcher_foreground.png")

# Capacitor also supplies mipmap/ic_launcher_foreground.png (the blue default mark).
# Android launchers may resolve that mipmap foreground from the adaptive icon.
# Replace it at every density with the same JSF artwork, not the Capacitor placeholder.
for name, size in [("mdpi",108),("hdpi",162),("xhdpi",216),("xxhdpi",324),("xxxhdpi",432)]:
    folder = root / f"mipmap-{name}"
    folder.mkdir(parents=True, exist_ok=True)
    fg.resize((size, size), Image.Resampling.LANCZOS).save(folder / "ic_launcher_foreground.png")

folder = root / "mipmap-anydpi-v26"
folder.mkdir(parents=True, exist_ok=True)
(folder / "ic_launcher.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/jsf_launcher_foreground"/>
</adaptive-icon>
''')
folder = root / "values"
folder.mkdir(parents=True, exist_ok=True)
(folder / "ic_launcher_background.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>
<resources><color name="ic_launcher_background">#080F20</color></resources>
''')


# PWA / Add-to-Home-Screen icons
web_icons = Path("www/icons")
web_icons.mkdir(parents=True, exist_ok=True)
im.resize((192, 192), Image.Resampling.LANCZOS).save(web_icons / "icon-192.png")
im.resize((512, 512), Image.Resampling.LANCZOS).save(web_icons / "icon-512.png")
