"""Extract 9x8 Volley formations from the supplied Classic-stage screenshots."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "references" / "stage-formations"
OUTPUT = ROOT / "lib" / "volley-formations.generated.json"
PUBLIC_REFERENCES = ROOT / "public" / "game" / "editor-references"
TARGET_COUNT = 81


def evenly_spaced(files: list[Path], count: int) -> list[Path]:
    if count == 1:
        return [files[0]]
    return [files[round(index * (len(files) - 1) / (count - 1))] for index in range(count)]


def source_grid(path: Path) -> tuple[list[list[str]], list[list[int]]]:
    rgb_image = np.asarray(Image.open(path).convert("RGB"), dtype=float)
    image = np.asarray(Image.fromarray(rgb_image.astype(np.uint8)).convert("L"), dtype=float)
    result: list[list[str]] = []
    variants: list[list[int]] = []

    for row in range(10):
        values: list[str] = []
        row_variants: list[int] = []
        for column in range(11):
            top = 52 + row * 31
            left = 31 + column * 31
            cell = image[top + 2 : top + 27, left + 2 : left + 27]
            core = cell[2:-3, 2:-3]
            bright_points = np.argwhere(core > 170)
            white_pixels = len(bright_points)
            small_center_glow = False
            if 12 <= white_pixels <= 80:
                min_y, min_x = bright_points.min(axis=0)
                max_y, max_x = bright_points.max(axis=0)
                center_y, center_x = bright_points.mean(axis=0)
                small_center_glow = (
                    (max_y - min_y <= 8 and max_x - min_x <= 8
                     and abs(center_y - core.shape[0] / 2) <= 4
                     and abs(center_x - core.shape[1] / 2) <= 4)
                    or max_y - min_y <= 3
                )
            rgb_cell = rgb_image[top + 2 : top + 27, left + 2 : left + 27]
            luminance = rgb_cell.mean(axis=2)
            maximum = rgb_cell.max(axis=2)
            minimum = rgb_cell.min(axis=2)
            saturation = np.divide(maximum - minimum, maximum, out=np.zeros_like(maximum), where=maximum > 0)
            median_luminance = float(np.median(luminance))
            median_saturation = float(np.median(saturation))
            saturated_coverage = float((saturation > 0.36).mean())
            # HP text is a strong cue, but many real cells have no label. Use
            # the cell face itself to retain pale stone and colored blocks too.
            text_brick = white_pixels >= 12 and float(cell.mean()) >= 35 and not small_center_glow
            pale_brick = median_luminance >= 76 and median_saturation < 0.38 and float(luminance.std()) < 76
            # Solid red/orange cells can be intentionally unlabelled; require
            # a nearly uniform saturated face so scenery cannot fill gaps.
            color_brick = (
                float(luminance.mean()) >= 34
                and median_saturation >= 0.78
                and saturated_coverage >= 0.9
                and float(luminance.std()) < 14
            )
            occupied = text_brick or pale_brick or color_brick

            if not occupied:
                values.append(".")
                row_variants.append(-1)
                continue

            without_text = cell.copy()
            without_text[without_text > 170] = np.nan
            def corner_mean(area: np.ndarray) -> float:
                return float(np.nanmean(area)) if not np.isnan(area).all() else float(cell.mean())

            corners = [
                corner_mean(without_text[2:10, 2:10]),
                corner_mean(without_text[2:10, -10:-2]),
                corner_mean(without_text[-10:-2, 2:10]),
                corner_mean(without_text[-10:-2, -10:-2]),
            ]
            gradient_y, gradient_x = np.gradient(cell)
            slash = float(np.mean(np.abs(gradient_x + gradient_y)))
            backslash = float(np.mean(np.abs(gradient_x - gradient_y)))
            diagonal_ratio = max(slash, backslash) / max(0.001, min(slash, backslash))
            corner_spread = float(max(corners) - min(corners))

            if diagonal_ratio >= 1.08 and corner_spread >= 35:
                # Shape numbers use the editor's NW, NE, SW and SE definitions.
                # The darkest corner is the removed half of the source tile.
                values.append(("4", "1", "2", "3")[int(np.nanargmin(corners))])
            else:
                values.append("#")
            sample = rgb_cell[3:-3, 3:-3]
            red, green, blue = (float(value) for value in np.median(sample.reshape(-1, 3), axis=0))
            maximum, minimum = max(red, green, blue), min(red, green, blue)
            hue = 0.0
            if maximum != minimum:
                if maximum == red:
                    hue = ((green - blue) / (maximum - minimum)) % 6
                elif maximum == green:
                    hue = (blue - red) / (maximum - minimum) + 2
                else:
                    hue = (red - green) / (maximum - minimum) + 4
                hue /= 6
            # Preserve source color changes and spatial rhythm as real brick types.
            color_band = int(hue * 6) % 6
            row_variants.append((color_band + row // 2 + column % 3) % 8)
        result.append(values)
        variants.append(row_variants)

    dense_rows = [row for row, values in enumerate(result) if sum(value != "." for value in values) >= 4]
    if dense_rows:
        last_formation_row = max(dense_rows)
        for row in range(last_formation_row + 1, len(result)):
            occupied_columns = [column for column, value in enumerate(result[row]) if value != "."]
            if len(occupied_columns) <= 2 and all(4 <= column <= 6 for column in occupied_columns):
                for column in occupied_columns:
                    result[row][column] = "."
                    variants[row][column] = -1

    return result, variants


def fit_to_editor(source: list[list[str]], source_variants: list[list[int]]) -> tuple[list[str], list[str]]:
    output: list[str] = []
    output_variants: list[str] = []

    for target_row in range(8):
        row_start = int(target_row * len(source) / 8)
        row_end = max(row_start + 1, int((target_row + 1) * len(source) / 8))
        source_rows = source[row_start:row_end]
        target_cells: list[str] = []
        target_variant_cells: list[str] = []

        for target_column in range(9):
            column_start = int(target_column * 11 / 9)
            column_end = max(column_start + 1, int((target_column + 1) * 11 / 9))
            candidates = [
                row[column]
                for row in source_rows
                for column in range(column_start, column_end)
                if row[column] != "."
            ]
            source_variant_values = [
                source_variants[row_start + row_offset][column]
                for row_offset, row in enumerate(source_rows)
                for column in range(column_start, column_end)
                if row[column] != "."
            ]
            if not candidates:
                target_cells.append(".")
                target_variant_cells.append(".")
            else:
                shape_candidates = [candidate for candidate in candidates if candidate != "#"]
                shape = max(set(shape_candidates), key=shape_candidates.count) if shape_candidates else "#"
                if shape_candidates and shape_candidates.count(shape) <= len(candidates) / 2:
                    shape = "#"
                target_cells.append(shape)
                target_variant_cells.append(str(round(sum(source_variant_values) / len(source_variant_values)) % 8))
        output.append("".join(target_cells))
        output_variants.append("".join(target_variant_cells))

    return output, output_variants


def main() -> None:
    collections: list[list[Path]] = []
    for folder in ("1", "2", "3"):
        files = sorted(
            (path for path in (SOURCE / folder).glob("*.jpg") if path.stat().st_size > 20_000),
            key=lambda path: int(path.stem),
        )
        if len(files) < 27:
            raise RuntimeError(f"Not enough valid screenshots in set {folder}: {len(files)}")
        collections.append(evenly_spaced(files, 27))

    selected = [collections[index % 3][index // 3] for index in range(TARGET_COUNT)]
    formations = []
    PUBLIC_REFERENCES.mkdir(parents=True, exist_ok=True)
    for index, path in enumerate(selected, start=1):
        shape_grid, variant_grid = source_grid(path)
        rows, variants = fit_to_editor(shape_grid, variant_grid)
        reference_path = PUBLIC_REFERENCES / f"stage-{index:03d}.jpg"
        shutil.copy2(path, reference_path)
        formations.append({
            "id": index,
            "reference": f"/game/editor-references/{reference_path.name}",
            "rows": rows,
            "variants": variants,
        })

    OUTPUT.write_text(json.dumps(formations, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(formations)} formations at {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
