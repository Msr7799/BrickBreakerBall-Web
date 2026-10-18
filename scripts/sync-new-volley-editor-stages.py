"""Append editor previews for the nine Volley stages added in the Android campaign.

The web editor uses an 8x9 formation preview, so the Android 11-column mask is
sampled to that preview size. The Android game remains the source of gameplay.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path


WEB_ROOT = Path(__file__).resolve().parents[1]
ANDROID_ROOT = Path(os.environ.get("BRICK_BREAKER_ANDROID_ROOT", str(WEB_ROOT.parent.parent / "AndroidStudioProjects/BrickBreakerBall")))
MASK_FILE = ANDROID_ROOT / "app/src/main/java/com/example/brick_breaker_ball/gameplay/VolleyRankedGeometry.kt"
FORMATION_FILE = WEB_ROOT / "lib/volley-formations.generated.json"
REFERENCE_ROOT = WEB_ROOT / "public/game/editor-references"
ADDED_STAGES = [(1, 8), (1, 9), (1, 10), (3, 7), (3, 8), (3, 9), (3, 10), (7, 8), (7, 9)]


def main() -> None:
    source = MASK_FILE.read_text(encoding="utf-8")
    masks = re.findall(r'^\s*"([.#1234/]+)",\s*$', source, flags=re.MULTILINE)
    if len(masks) != 89:
        raise ValueError(f"Expected 89 Android masks for levels 2-90, found {len(masks)}")

    current = json.loads(FORMATION_FILE.read_text(encoding="utf-8"))
    if len(current) not in (81, 90):
        raise ValueError(f"Expected 81 or 90 editor formations, found {len(current)}")
    if len(current) == 90:
        print("Editor already includes all 90 formation previews")
        return

    additions = []
    for offset, (world, stage) in enumerate(ADDED_STAGES):
        level_id = (world - 1) * 10 + stage
        source_rows = masks[level_id - 2].split("/")
        if any(len(row) != 11 for row in source_rows):
            raise ValueError(f"Invalid Android mask width at level {level_id}")
        rows = []
        variants = []
        squares = []
        colors = {"#": "#52c9e8", "1": "#95e77a", "2": "#eaca67", "3": "#d485ec", "4": "#fa8a6b"}
        for row in range(8):
            source_row = source_rows[min(len(source_rows) - 1, round((row + .5) * len(source_rows) / 8 - .5))]
            cells = "".join(source_row[min(10, round((column + .5) * 11 / 9 - .5))] for column in range(9))
            rows.append(cells)
            variants.append("".join(str((row + column) % 8) if cell != "." else "." for column, cell in enumerate(cells)))
            for column, cell in enumerate(cells):
                if cell != ".":
                    squares.append(f'<rect x="{32 + column * 34}" y="{56 + row * 34}" width="29" height="29" rx="3" fill="{colors[cell]}"/>')

        reference_name = f"volley-level-{level_id:03d}.svg"
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 370 370">'
            '<rect width="370" height="370" fill="#101622"/>'
            f'<text x="32" y="33" fill="#e9f8ff" font-family="Arial" font-size="17" font-weight="bold">VOLLEY LEVEL {level_id:02d}</text>'
            + "".join(squares)
            + '<text x="32" y="353" fill="#91a6b7" font-family="Arial" font-size="12">Simplified editor geometry preview</text>'
            + "</svg>\n"
        )
        (REFERENCE_ROOT / reference_name).write_text(svg, encoding="utf-8")
        additions.append({
            "id": 82 + offset,
            "reference": f"/game/editor-references/{reference_name}",
            "rows": rows,
            "variants": variants,
        })

    original = FORMATION_FILE.read_text(encoding="utf-8").rstrip()
    FORMATION_FILE.write_text(
        original[:-1].rstrip() + ",\n" + ",\n".join(json.dumps(item, ensure_ascii=False, indent=2) for item in additions) + "\n]\n",
        encoding="utf-8",
    )
    print("Added 9 editor formation previews for the 90-stage Volley campaign")


if __name__ == "__main__":
    main()
