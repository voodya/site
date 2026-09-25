import json
import shutil
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, unquote

root = Path(__file__).resolve().parent
source = Path('F:/Some junk/Content')
target = root / 'public/Data/Content'
compressed = root / 'compressed-content'
extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mov', '.webm', '.avif'}
limit = 25 * 1024 * 1024
copies = []
for original in sorted(source.rglob('*')):
    if not original.is_file() or original.suffix.lower() not in extensions:
        continue
    relative = original.relative_to(source)
    replacement = compressed / relative
    selected = replacement if replacement.is_file() else original
    if selected.stat().st_size > limit:
        raise RuntimeError(f'File exceeds Static Assets limit: {selected}')
    copies.append((selected, target / relative))

content = json.loads((root / 'Content.cloudflare.json').read_text(encoding='utf-8-sig'))
changed = 0
def update(value):
    global changed
    if isinstance(value, dict):
        return {key: update(item) for key, item in value.items()}
    if isinstance(value, list):
        return [update(item) for item in value]
    if isinstance(value, str):
        parsed = urlsplit(value) if value.startswith(('https://', 'http://')) else None
        if parsed and parsed.hostname in ('www.voodyadev.online', 'voodyadev.online'):
            changed += 1
            return urlunsplit(parsed._replace(scheme='https', netloc='voodyadev.com'))
    return value
content = update(content)

for selected, destination in copies:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(selected, destination)

missing = []
checked = 0
def validate(url):
    global checked
    if not url:
        return
    parsed = urlsplit(url)
    if parsed.hostname == 'voodyadev.com':
        checked += 1
        path = root / 'public' / unquote(parsed.path).lstrip('/')
        if not path.is_file():
            missing.append(str(path))
for company in content:
    validate(company.get('LogoUrl'))
    for project in company.get('Projects', []):
        validate(project.get('ImageUrl'))
        for field in ('ScreenUrls', 'VideoUrls'):
            for url in project.get(field, []):
                validate(url)
if missing:
    raise RuntimeError('Missing linked files:\n' + '\n'.join(missing))
(root / 'public/assets/Content.json').write_text(json.dumps(content, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'copied_media': len(copies), 'compressed_replacements': sum(1 for selected, _ in copies if selected.is_relative_to(compressed)), 'changed_urls': changed, 'checked_media_references': checked, 'bytes': sum(p.stat().st_size for _, p in copies)}, indent=2))
