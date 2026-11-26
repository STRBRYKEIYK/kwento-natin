import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[2]
story = json.loads((root / 'src/letter/data/story.json').read_text(encoding='utf-8'))
ids = ['cover','a0','b1','b6','b7','c4','c6','o20-10','o29-13','n05-04']
photos = {p.get('id'): p for p in story['photos']}
files = [(key, root / 'public' / photos[key]['src']) for key in ids]
files.append(('binondo-nov17',root / 'public/assets/photos/BINONDO DATE NOV 17/photo_425@18-11-2026_00-34-28.jpg'))
canvas = Image.new('RGB',(1000,900),'#eeeeee')
draw = ImageDraw.Draw(canvas)
for i,(key,path) in enumerate(files):
    pic = ImageOps.contain(ImageOps.exif_transpose(Image.open(path)).convert('RGB'),(240,260))
    x,y = (i%4)*250,(i//4)*300
    canvas.paste(pic,(x+(250-pic.width)//2,y))
    draw.text((x+12,y+272),key,fill='#111111')
canvas.save(root / 'three-brain-out/2026-11-26-111/contact-sheet.jpg')
