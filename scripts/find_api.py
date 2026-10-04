import urllib.request
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

build_id = 'uQvNXRaRclkFWZB1XAQdK'
manifest_url = f'https://www.dofy.in/_next/static/{build_id}/_buildManifest.js'

req = urllib.request.Request(manifest_url, headers={'User-Agent': 'Mozilla/5.0'})
content = urllib.request.urlopen(req).read().decode('utf-8')

# Find all chunks in manifest
chunks = set(re.findall(r'"(static/chunks/[^"]+\.js)"', content))
print(f'Total chunks in manifest: {len(chunks)}')

for c in sorted(chunks):
    chunk_url = f'https://www.dofy.in/_next/{c}'
    req2 = urllib.request.Request(chunk_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        js = urllib.request.urlopen(req2, timeout=5).read().decode('utf-8', errors='ignore')
        if 'GetModelVariantBySeriesModelName' in js:
            print(f'Found GetModelVariantBySeriesModelName in {c}!')
            idx = js.find('GetModelVariantBySeriesModelName')
            print(js[max(0, idx-100):idx+300])
            break
    except Exception as e:
        pass
