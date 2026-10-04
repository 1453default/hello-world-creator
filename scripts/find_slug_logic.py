import urllib.request
import re
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

# In Next.js, the brand page route was: "/[ln]/[location]/[device]/[brandId]"
# Let's inspect the JS chunks for this page!
build_id = 'uQvNXRaRclkFWZB1XAQdK'
manifest_url = f'https://www.dofy.in/_next/static/{build_id}/_buildManifest.js'

req = urllib.request.Request(manifest_url, headers={'User-Agent': 'Mozilla/5.0'})
content = urllib.request.urlopen(req).read().decode('utf-8')

matches = re.findall(r'"static/chunks/pages/[^"]+"', content)
for ma in set(matches):
    if 'brandId' in ma:
        print('Brand page chunk:', ma)
    if 'modelId' in ma:
        print('Model page chunk:', ma)


