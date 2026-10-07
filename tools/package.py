"""Build dist/sinhala-typing-v<version>.zip for a GitHub release / the Chrome Web Store.

Run from the repo root:  python tools/package.py

Zips only the files the extension needs (manifest.json, src/, popup/, icons/) with
forward-slash paths, then checks that every file the manifest, popup and background
script reference is inside the zip.
"""
import json
import re
import sys
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent
INCLUDE_DIRS = ('src', 'popup', 'icons')


def normalize(path):
    parts = []
    for seg in PurePosixPath(path).parts:
        if seg == '..':
            parts.pop()
        elif seg != '.':
            parts.append(seg)
    return '/'.join(parts)


def referenced_files(manifest):
    refs = {
        manifest['background']['service_worker'],
        manifest['action']['default_popup'],
        *manifest['icons'].values(),
        *manifest['action']['default_icon'].values(),
    }
    for cs in manifest['content_scripts']:
        refs.update(cs['js'])
    html = (ROOT / 'popup/popup.html').read_text(encoding='utf-8')
    for ref in re.findall(r'(?:src|href)="([^"#]+)"', html):
        refs.add(normalize(f'popup/{ref}'))
    # background.js swaps between these at runtime
    refs.update(f'icons/{prefix}{size}.png' for prefix in ('icon', 'off-') for size in (16, 32, 48, 128))
    return refs


def main():
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    out = ROOT / 'dist' / f"sinhala-typing-v{manifest['version']}.zip"
    out.parent.mkdir(exist_ok=True)

    files = ['manifest.json'] + sorted(
        p.relative_to(ROOT).as_posix()
        for d in INCLUDE_DIRS for p in (ROOT / d).rglob('*') if p.is_file()
    )
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in files:
            z.write(ROOT / f, f)

    missing = sorted(referenced_files(manifest) - set(files))
    print(f'{out.relative_to(ROOT).as_posix()}  {out.stat().st_size / 1024:.1f} KB, {len(files)} files')
    if missing:
        print('MISSING from package:', ', '.join(missing))
        sys.exit(1)


if __name__ == '__main__':
    main()
