#!/usr/bin/env python3
"""Verify an R4 consumer's vendored sources against the pinned ForgeHUD commit."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('consumer', type=Path)
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[1]
    vendor = args.consumer / 'src/lib/vendor/forge-hud'
    manifest = json.loads((vendor / 'provenance.json').read_text(encoding='utf-8'))
    revision = manifest['revision']
    if not re.fullmatch(r'[0-9a-f]{40}', revision):
        raise SystemExit('Invalid pinned revision')
    expected = set(manifest['sha256'])
    actual = {str(p.relative_to(vendor)) for p in vendor.rglob('*') if p.is_file()}
    if actual != expected | {'provenance.json'}:
        raise SystemExit('Vendored file set differs from manifest')
    for relative, digest in manifest['sha256'].items():
        path = Path(relative)
        if path.is_absolute() or '..' in path.parts:
            raise SystemExit('Invalid relative source path')
        upstream = subprocess.check_output([
            'git', '-C', str(repo), 'show', f'{revision}:forge-hud-svelte/src/{relative}'
        ])
        local = (vendor / relative).read_bytes()
        if upstream != local or hashlib.sha256(local).hexdigest() != digest:
            raise SystemExit(f'Vendor mismatch: {relative}')
    print(f'PASS: {len(expected)} source files match ForgeHUD {revision}')


if __name__ == '__main__':
    main()
