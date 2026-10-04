import urllib.request
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://www.dofy.in/_next/static/chunks/8246-7f32195f2d86cfac.js'
js = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8')
urls = set(re.findall(r'https?://[a-zA-Z0-9_\-\.:/]+', js))
print('URLs in chunk 8246:', urls)

# Search for api or backend url
matches = re.findall(r'["\']https?://[^"\']+["\']', js)
print('Quoted URLs:', set(matches))
