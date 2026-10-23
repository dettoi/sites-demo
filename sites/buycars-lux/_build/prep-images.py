# Разовая подготовка фото: копирует выбранные кадры из выгрузки Telegram-канала
# и делает превью 480x360 для списков.
# Запуск: python _build/prep-images.py <папка tg/photos>
# Выбор кадров и их порядок: _build/photo-pick.json
import json, os, shutil, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src_root = sys.argv[1]
pick = json.load(open(os.path.join(ROOT, '_build', 'photo-pick.json'), encoding='utf-8'))

for slug, v in pick.items():
    out = os.path.join(ROOT, 'img', 'cars', slug)
    os.makedirs(os.path.join(out, 't'), exist_ok=True)
    for k in v['gallery']:
        src = os.path.join(src_root, str(v['tg']), f'{k}.jpg')
        dst = os.path.join(out, f'{k}.jpg')
        shutil.copyfile(src, dst)
        im = Image.open(src).convert('RGB')
        im.thumbnail((480, 360), Image.LANCZOS)
        im.save(os.path.join(out, 't', f'{k}.jpg'), quality=80, optimize=True, progressive=True)
    print(slug, len(v['gallery']))
