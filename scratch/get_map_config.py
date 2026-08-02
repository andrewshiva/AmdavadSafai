import urllib.request
import re

urls = [
    "https://nammakasa.vercel.app/assets/index-RwzcTxrn.js",
    "https://nammakasa.vercel.app/assets/main-752NTFI-.js"
]

for url in urls:
    print(f"=== Reading {url} ===")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        js = urllib.request.urlopen(req).read().decode('utf-8')
        
        print("Leaflet/Mapbox/Maplibre occurrences:")
        words = ['maplibre', 'mapbox', 'leaflet', 'style', 'TileLayer', 'basemaps', 'vector', 'maptiler']
        for w in words:
            count = len(re.findall(re.escape(w), js, re.IGNORECASE))
            print(f" - '{w}': {count}")
            
        print("URL search:")
        found_urls = re.findall(r'https?://[^\s"\'\}]+', js)
        for fu in found_urls[:15]:
            if 'tile' in fu or 'map' in fu or 'json' in fu or 'style' in fu or 'vector' in fu:
                print(" -", fu)
    except Exception as e:
        print("Error:", e)
