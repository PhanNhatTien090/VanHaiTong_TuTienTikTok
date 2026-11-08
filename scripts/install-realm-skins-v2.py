"""Validate/copy separate original PNGs; never resample, cut an atlas, or alter alpha."""
from pathlib import Path
from PIL import Image
import json
import re
import shutil
import os
import time

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'output/realm-skins-v2'
DEST = ROOT / 'public/assets/realm-skins-v2'
REALMS = [(0,'pham-nhan'),(1,'luyen-khi'),(2,'truc-co'),(3,'kim-dan'),(4,'nguyen-anh'),(5,'hoa-than'),(14,'dao-to'),(15,'thien-ton'),(16,'than-quan'),(17,'than-vuong'),(18,'than-de'),(19,'than-ton'),(20,'than-to'),(21,'hong-mong-chi-ton')]
VARIANTS = ['male-standing','female-standing','male-seated','female-seated']
# User requested applying the redesigned god sets on 2026-11-06.
# Only complete v3 sets may install; rejected v2 god drafts remain inactive.
APPROVED_REALMS = {0, 1, 2, 3, 4, 5, 16, 17, 18, 19, 20, 21}

def atomic_text(path, text):
    tmp = path.with_name(path.name + '.tmp')
    tmp.write_text(text, encoding='utf-8')
    for attempt in range(10):
        try:
            os.replace(tmp, path)
            return
        except PermissionError:
            if attempt == 9:
                raise
            time.sleep(.05)

manifest = {}
for realm, slug in REALMS:
    if realm not in APPROVED_REALMS:
        continue
    version = 'realm-skins-v3' if realm >= 16 else 'realm-skins-v2'
    source = ROOT / 'output' / version
    dest = ROOT / 'public/assets' / version
    if not all((source / slug / (v+'-v1.png')).is_file() for v in VARIANTS):
        continue
    frames = {}
    for variant in VARIANTS:
        filename = variant+'-v1.png'
        src = source / slug / filename
        with Image.open(src) as im:
            assert im.mode == 'RGBA', f'{src}: expected RGBA'
            alpha = im.getchannel('A')
            assert alpha.histogram()[0] > im.width*im.height*.08, f'{src}: background is not transparent'
            ratio = im.width/im.height
            expected = 2/3 if variant.endswith('standing') else 1
            assert abs(ratio-expected) < .04, f'{src}: wrong canvas aspect {im.size}'
            bounds = alpha.point(lambda p: 255 if p >= 16 else 0).getbbox()
            assert bounds, f'{src}: empty image'
            frames[variant] = {'url': f'/assets/{version}/{slug}/{filename}', 'size': list(im.size), 'bounds': list(bounds)}
        target = dest / slug / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or (src.stat().st_size, src.stat().st_mtime_ns) != (target.stat().st_size, target.stat().st_mtime_ns):
            shutil.copy2(src, target)
    manifest[realm] = frames

content = 'export const REALM_SKIN_IMAGES=Object.freeze('+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+');\n'
data = ROOT / 'public/realm-skins-v2-data.js'
changed = not data.exists() or data.read_text(encoding='utf-8') != content
if changed:
    atomic_text(data, content)
    index = ROOT / 'public/index.html'
    html = re.sub(r'src="/app\.js\?build=[^"]+"', 'src="/app.js?build=kim-dan-v2-skins-'+str(int(time.time()))+'"', index.read_text(encoding='utf-8'))
    atomic_text(index, html)
print(json.dumps({'installedRealms':list(manifest),'installedImages':len(manifest)*4,'updated':changed}))
