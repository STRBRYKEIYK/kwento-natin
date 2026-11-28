"""Stage the supplied necklace showcases; keep the Downloads originals intact."""
from pathlib import Path
import shutil

destination = Path('public/assets/kwintas')
destination.mkdir(parents=True, exist_ok=True)
files = {
    'photo_2026-09-11_22-32-45.jpg': 'jersey-oval.jpg',
    'photo_2026-09-11_22-32-50.jpg': 'keith-hexagon.jpg',
    'photo_2026-09-11_22-32-55.jpg': 'necklaces-together.jpg',
    'Gemini_Generated_Image_ip1gk8ip1gk8ip1g.jpg': 'necklace-portrait.jpg',
    'PP40761 12 (2).png': 'jersey-design.png',
    'PP40761 22 (4).png': 'keith-design.png',
}
for original, name in files.items():
    shutil.copyfile(Path.home() / 'Downloads' / original, destination / name)

# Reuse the existing checksum-verified, create-only Storage publishing workflow.
script = Path('scripts/publish-yakap-assets.mjs').read_text(encoding='utf-8')
script = script.replace(
    "const files = ['public/models/yakap-poster.png', 'public/menu/img/yakap.png'];",
    'const files = ' + repr([str(destination / name).replace('\\', '/') for name in files.values()]) + ';',
).replace("  const bytes = await readFile(source);", "  const extension = source.endsWith('.png') ? 'png' : 'jpg';\n  const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';\n  const bytes = await readFile(source);")
script = script.replace('${sha}.png', '${sha}.${extension}').replace("contentType: 'image/png'", 'contentType').replace('Content-Type: image/png', 'Content-Type: ${contentType}').replace('yakap-', 'kwintas-')
Path('scripts/publish-kwintas-assets.mjs').write_text(script, encoding='utf-8')
print('Staged 6 unmodified showcases and their Storage publisher.')
