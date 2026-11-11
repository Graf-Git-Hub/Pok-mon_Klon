"""Original 16-pixel interior tiles, drawn on the Echo four-shade palette."""

from PIL import Image, ImageDraw
from gb_actors import P

# Ordered to match the edge and corner selection in the preview renderer.
BOUNDARY = ("north", "south", "west", "east", "nw", "ne", "sw", "se", "threshold")


def interior_tile(name, fallback):
    image = Image.new("RGB", (16, 16), P[0])
    draw = ImageDraw.Draw(image)

    def box(x, y, width, height, shade):
        draw.rectangle((x, y, x + width - 1, y + height - 1), fill=P[shade])

    if name == "room_floor":
        box(0, 0, 16, 16, 1)
        for y in (7, 15):
            box(0, y, 16, 1, 2)
        for x, y in ((3, 3), (10, 11)):
            box(x, y, 4, 1, 0)
            box(x + 5, y + 1, 2, 1, 0)
    elif name == "bookshelf":
        box(1, 0, 14, 16, 3)
        box(2, 1, 12, 1, 1)
        box(3, 3, 10, 9, 2)
        box(3, 6, 10, 1, 3)
        box(4, 4, 3, 2, 0)
        box(8, 3, 2, 3, 1)
        box(11, 4, 1, 2, 0)
        box(4, 9, 2, 3, 1)
        box(7, 8, 4, 4, 0)
        box(8, 9, 2, 1, 2)
        box(2, 13, 12, 1, 1)
        box(3, 15, 10, 1, 2)
    elif name == "workbench":
        box(1, 3, 14, 9, 3)
        box(2, 4, 12, 4, 1)
        box(2, 4, 12, 1, 0)
        box(2, 9, 12, 2, 2)
        box(3, 12, 2, 4, 3)
        box(11, 12, 2, 4, 3)
        # Hammer and tongs on the work surface.
        box(4, 5, 3, 2, 3)
        draw.line((5, 6, 8, 7), fill=P[3])
        draw.line((10, 5, 12, 7, 13, 5), fill=P[2])
    elif name == "forge":
        box(5, 0, 6, 4, 3)
        box(6, 1, 3, 3, 2)
        box(1, 4, 14, 12, 3)
        box(2, 5, 12, 2, 1)
        box(2, 8, 2, 5, 2)
        box(12, 8, 2, 5, 2)
        draw.polygon(((5, 12), (6, 9), (7, 10), (9, 7), (11, 12)), fill=P[1])
        draw.polygon(((7, 12), (9, 10), (10, 12)), fill=P[0])
        box(2, 14, 12, 1, 2)
    elif name == "anvil":
        draw.polygon(((0, 5), (3, 4), (14, 4), (15, 6), (12, 9), (9, 9),
                      (9, 11), (12, 13), (12, 15), (4, 15), (4, 13), (7, 11),
                      (7, 9), (4, 9)), fill=P[3])
        box(3, 5, 10, 1, 0)
        box(5, 7, 7, 1, 2)
        box(5, 13, 6, 1, 2)
    elif name == "crate":
        box(2, 3, 12, 12, 3)
        box(3, 4, 10, 9, 1)
        box(3, 4, 10, 1, 0)
        box(3, 11, 10, 2, 2)
        box(4, 5, 1, 8, 2)
        box(11, 5, 1, 8, 2)
        box(6, 6, 4, 1, 3)
    elif name == "bed":
        box(1, 0, 14, 16, 3)
        box(2, 1, 12, 2, 2)
        box(3, 3, 10, 4, 0)
        box(2, 7, 12, 7, 2)
        box(3, 7, 10, 2, 1)
        box(7, 10, 2, 3, 1)
        box(2, 14, 12, 1, 1)
    elif name == "chair":
        box(3, 2, 10, 13, 3)
        box(4, 3, 8, 4, 2)
        box(4, 8, 8, 4, 1)
        box(5, 8, 6, 1, 0)
        box(5, 13, 6, 2, 0)
    elif name == "table":
        box(1, 3, 14, 9, 3)
        box(2, 4, 12, 4, 1)
        box(2, 4, 12, 1, 0)
        box(2, 9, 12, 2, 2)
        box(3, 12, 2, 3, 3)
        box(11, 12, 2, 3, 3)
        box(7, 5, 3, 2, 2)
    elif name == "counter":
        # The tabletop reaches both tile edges to make a continuous service desk.
        box(0, 3, 16, 11, 3)
        box(0, 4, 16, 4, 1)
        box(0, 4, 16, 1, 0)
        box(1, 9, 14, 3, 2)
        box(6, 9, 4, 1, 1)
    elif name == "heal_pod":
        box(2, 2, 12, 13, 3)
        box(3, 3, 10, 10, 2)
        box(4, 4, 8, 6, 1)
        box(7, 4, 2, 6, 3)
        box(5, 6, 6, 2, 3)
        box(4, 11, 5, 1, 0)
        box(11, 11, 1, 1, 0)
    elif name == "computer":
        box(2, 1, 12, 10, 3)
        box(4, 3, 8, 6, 2)
        box(5, 4, 6, 1, 0)
        box(5, 6, 4, 1, 1)
        box(6, 10, 4, 2, 3)
        box(3, 12, 10, 3, 3)
        box(4, 12, 8, 1, 1)
    elif name == "capsule":
        box(4, 1, 8, 14, 3)
        box(3, 3, 10, 9, 3)
        box(5, 3, 6, 9, 1)
        box(6, 4, 1, 5, 0)
        box(8, 7, 2, 3, 2)
        box(3, 13, 10, 2, 2)
    elif name == "room_wall":
        return boundary_tile("north")
    else:
        return fallback
    return image


def boundary_tile(name):
    image = Image.new("RGB", (16, 16), P[3])
    draw = ImageDraw.Draw(image)

    def box(x, y, width, height, shade):
        draw.rectangle((x, y, x + width - 1, y + height - 1), fill=P[shade])

    if name in ("north", "nw", "ne"):
        box(0, 3, 16, 10, 2)
        box(0, 4, 16, 1, 1)
        box(0, 8, 16, 1, 3)
        box(4, 5, 1, 3, 3)
        box(11, 9, 1, 4, 3)
        box(0, 13, 16, 2, 1)
    elif name in ("south", "sw", "se", "threshold"):
        box(0, 1, 16, 4, 2)
        box(0, 1, 16, 1, 1)
    if name in ("west", "nw", "sw"):
        # The outside edge stays in one column all the way around the room.
        box(0, 0, 9, 16, 3)
        top = 3 if name == "nw" else 0
        bottom = 5 if name == "sw" else 16
        box(9, top, 7, bottom - top, 2)
        box(13, top, 2, bottom - top, 1)
        if name == "nw":
            box(9, 3, 7, 1, 1)
        elif name == "sw":
            box(9, 1, 7, 1, 1)
    if name in ("east", "ne", "se"):
        return boundary_tile({"east": "west", "ne": "nw", "se": "sw"}[name]).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if name == "threshold":
        box(2, 0, 12, 11, 2)
        box(3, 0, 10, 4, 1)
        box(3, 5, 10, 1, 0)
        box(3, 6, 10, 3, 1)
        box(2, 10, 12, 1, 1)
    return image


ROOM_FLOORS = ("Wohnhaus", "Laden", "Heilstation", "Teamtausch")


def room_floor(name):
    image = Image.new("RGB", (16, 16), P[1] if name != "Heilstation" else P[0])
    draw = ImageDraw.Draw(image)
    if name == "Wohnhaus":
        for y in (7, 15):
            draw.line((0, y, 15, y), fill=P[2])
        for x, y in ((3, 0), (11, 8)):
            draw.line((x, y, x, y + 6), fill=P[2])
            draw.line((x + 2, y + 3, x + 4, y + 3), fill=P[0])
    elif name == "Laden":
        for x, y in ((0, 0), (8, 8)):
            draw.rectangle((x, y, x + 7, y + 7), fill=P[0])
    elif name == "Heilstation":
        draw.line((0, 15, 15, 15), fill=P[1])
        draw.line((15, 0, 15, 15), fill=P[1])
        draw.rectangle((6, 6, 8, 8), fill=P[1])
    elif name == "Teamtausch":
        draw.line((0, 15, 15, 15), fill=P[2])
        draw.line((15, 0, 15, 15), fill=P[2])
        for x, y in ((2, 2), (12, 2), (2, 12), (12, 12)):
            draw.point((x, y), fill=P[2])
    return image


def build_boundaries(out):
    tiles = [boundary_tile(name) for name in BOUNDARY] + [room_floor(name) for name in ROOM_FLOORS]
    sheet = Image.new("RGB", (16 * len(tiles), 16))
    for column, tile in enumerate(tiles):
        sheet.paste(tile, (column * 16, 0))
    sheet.save(out / "interior_edges.png")
