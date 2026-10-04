import glob
import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

import urllib.request
import json
import re

req = urllib.request.Request(
    'https://www.dofy.in/in-en/india/sell-old-phone/apple',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        print('Live page length:', len(content))
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', content)
        if m:
            print('Found __NEXT_DATA__! Length:', len(m.group(1)))
            data = json.loads(m.group(1))
            print('Keys in data:', list(data.keys()))
            with open('scripts/next_data_apple.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print('Saved to scripts/next_data_apple.json')
        else:
            print('No __NEXT_DATA__ found')
            # Look for scripts or state
            scripts = re.findall(r'<script[^>]*src="([^"]+)"', content)
            print('Scripts count:', len(scripts))
            for s in scripts[:5]:
                print(' ', s)
except Exception as e:
    print('Fetch error:', e)



