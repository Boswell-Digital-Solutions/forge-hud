#!/usr/bin/env python3
"""Check local documentation structure and freshness; no registry certification."""
from pathlib import Path
import json
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def check() -> list[str]:
    errors: list[str] = []
    system = ROOT / 'doc/system'
    manifest = json.loads((ROOT / 'doc/documentation-manifest.json').read_text())
    index = (system / '_index.md').read_text()
    chapters = sorted(system.glob('[0-9][0-9]-*.md'))
    if not chapters:
        errors.append('No numbered chapters')
    for path in system.iterdir():
        if path.name in ('_index.md', 'BUILD.sh'):
            continue
        if not path.is_file() or not re.fullmatch(r'(?:0[1-9]|[1-9][0-9])-[a-z0-9]+(?:-[a-z0-9]+)*\.md', path.name):
            errors.append(f'Invalid flat chapter path: {path.name}')
    indexed = re.findall(r'`([0-9][0-9]-[^`]+\.md)`', index)
    if indexed != [p.name for p in chapters]:
        errors.append('Index must list every chapter once in lexical order')
    prefix = manifest['prefix']
    output = manifest['assembled_output']
    if not re.fullmatch('[a-z0-9]{3}', prefix) or output != f'doc/{prefix}SYSTEM.md':
        errors.append('Invalid prefix/output relationship')
    if output not in index:
        errors.append('Index omits assembled output')
    expected = index + '\n---\n'
    for path in chapters:
        body = path.read_text()
        if re.search(r'^# ', body, re.M):
            errors.append(f'Chapter has a top-level heading: {path.name}')
        expected += '\n' + body + '\n---\n'
    built = ROOT / output
    if not built.exists() or built.read_text() != expected:
        errors.append('Assembled output is missing/stale; run bash doc/system/BUILD.sh')
    for path in [ROOT / 'README.md', *sorted((ROOT / 'doc').rglob('*.md')), *sorted((ROOT / 'docs').rglob('*.md'))]:
        body = path.read_text()
        # Skip fenced examples when checking actual inline Markdown links.
        prose = re.sub(r'```.*?```', '', body, flags=re.S)
        for link in re.findall(r'\[[^\]]*\]\(([^)]+)\)', prose):
            uri = urlsplit(link.strip('<>'))
            if uri.scheme or not uri.path:
                continue
            target = (path.parent / unquote(uri.path)).resolve()
            if not target.is_relative_to(ROOT) or not target.exists():
                errors.append(f'{path.relative_to(ROOT)}: broken/outside-repo link {link}')
    return errors


if __name__ == '__main__':
    try:
        findings = check()
    except (OSError, ValueError, KeyError) as error:
        findings = [str(error)]
    for finding in findings:
        print(f'FAIL: {finding}', file=sys.stderr)
    if findings:
        sys.exit(1)
    print('PASS: flat chapters, complete index, current assembly and relative links.')
    print('Central prefix/documentation registration remains pending.')
