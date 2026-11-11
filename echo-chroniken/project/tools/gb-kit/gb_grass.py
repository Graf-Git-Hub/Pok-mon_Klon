"""Two bent poses of tall grass and their foreground masks, at native scale."""

from PIL import Image, ImageColor
from gb_actors import P


def build_rustle(out, grass):
    sheet = Image.new("RGBA", (64, 16))
    background = ImageColor.getrgb(P[0])
    for frame, direction in enumerate((-1, 1)):
        bent = Image.new("RGB", (16, 16), background)
        for y in range(16):
            shift = direction * (3 * (15 - y) // 15 + (y < 13))
            for x in range(16):
                dest = x + shift
                if 0 <= dest < 16:
                    bent.putpixel((dest, y), grass.getpixel((x, y)))
        sheet.paste(bent, (frame * 16, 0))
        for y in range(10, 16):
            for x in range(16):
                pixel = bent.getpixel((x, y))
                if pixel != background:
                    sheet.putpixel((32 + frame * 16 + x, y), pixel + (255,))
    sheet.save(out / "grass_rustle.png")
