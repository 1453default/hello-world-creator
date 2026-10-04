import urllib.request
import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://www.dofy.in/_next/static/uQvNXRaRclkFWZB1XAQdK/_buildManifest.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        print('Manifest length:', len(content))
        # routes in buildManifest are object keys
        # e.g. "/[ln]/...": [...]
        keys = re.findall(r'"(/[a-zA-Z0-9_\-\[\]/]+)":', content)
        print('Routes found:', len(keys))
        for k in sorted(set(keys)):
            print('  ', k)
except Exception as e:
    print('Error:', e)
