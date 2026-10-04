import urllib.request
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://www.dofy.in/_next/static/chunks/pages/[ln]/[location]/[device]/[brandId]-e34cb7e5ad74d1b6.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
js = urllib.request.urlopen(req).read().decode('utf-8')

print('Length of brandId chunk:', len(js))
with open('scripts/brand_chunk.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Saved brand_chunk.js')

# Search for mentions of .replace or toLowerCase or sell-old-phone
matches = re.findall(r'[^;{}]{0,80}(?:toLowerCase|replace|\.Name|\.DisplayName|\.EnumName)[^;{}]{0,80}', js)
for m in matches[:20]:
    print('Match:', m.strip())

