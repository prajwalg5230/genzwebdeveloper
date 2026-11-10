import os
import urllib.request
import concurrent.futures
import time

BASE_URL = "https://genzwebdeveloper.com"
TARGET_DIR = "/data/data/com.termux/files/home/genzwebdeveloper"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# List of files to download
URL_LIST = [
    # Root files
    ("/", "index.html"),
    ("/robots.txt", "robots.txt"),
    ("/favicon.ico", "favicon.ico"),
    ("/icon.png", "icon.png"),
    ("/apple-icon.png", "apple-icon.png"),
    ("/opengraph-image.jpg", "opengraph-image.jpg"),
    ("/twitter-image.jpg", "twitter-image.jpg"),
    ("/film-start/opening.jpg", "film-start/opening.jpg"),

    # Next.js chunks
    ("/_next/static/chunks/0go-_m4lzfxrh.css", "_next/static/chunks/0go-_m4lzfxrh.css"),
    ("/_next/static/chunks/01ia5xyp5ycu-.js", "_next/static/chunks/01ia5xyp5ycu-.js"),
    ("/_next/static/chunks/0cz1d0mv5g_q7.js", "_next/static/chunks/0cz1d0mv5g_q7.js"),
    ("/_next/static/chunks/0umf92h1sb77c.js", "_next/static/chunks/0umf92h1sb77c.js"),
    ("/_next/static/chunks/13ms3qgn0k775.js", "_next/static/chunks/13ms3qgn0k775.js"),
    ("/_next/static/chunks/14qc6bt-zv512.js", "_next/static/chunks/14qc6bt-zv512.js"),
    ("/_next/static/chunks/19wg2q9r2_sev.js", "_next/static/chunks/19wg2q9r2_sev.js"),
    ("/_next/static/chunks/1f3_j0-7srs8o.js", "_next/static/chunks/1f3_j0-7srs8o.js"),
    ("/_next/static/chunks/1jv3hi029rv0w.js", "_next/static/chunks/1jv3hi029rv0w.js"),
    ("/_next/static/chunks/1ts2hox1kwh3u.js", "_next/static/chunks/1ts2hox1kwh3u.js"),
    ("/_next/static/chunks/24sa7su-iniib.js", "_next/static/chunks/24sa7su-iniib.js"),
    ("/_next/static/chunks/274tca-4r6qe5.js", "_next/static/chunks/274tca-4r6qe5.js"),
    ("/_next/static/chunks/2lvw102_71ypr.js", "_next/static/chunks/2lvw102_71ypr.js"),
    ("/_next/static/chunks/2x4rzy955jh6i.js", "_next/static/chunks/2x4rzy955jh6i.js"),
    ("/_next/static/chunks/3ohbouudb2ua1.js", "_next/static/chunks/3ohbouudb2ua1.js"),
    ("/_next/static/chunks/3wbm-994r45kr.js", "_next/static/chunks/3wbm-994r45kr.js"),
    ("/_next/static/chunks/4007o3jdc8l7o.js", "_next/static/chunks/4007o3jdc8l7o.js"),
    ("/_next/static/chunks/41gcjpkr2f2ca.js", "_next/static/chunks/41gcjpkr2f2ca.js"),
    ("/_next/static/chunks/44qxpx5bpboi8.js", "_next/static/chunks/44qxpx5bpboi8.js"),
    ("/_next/static/chunks/turbopack-3-ry682tkyiqk.js", "_next/static/chunks/turbopack-3-ry682tkyiqk.js"),
    ("/_next/static/chunks/turbopack-44n63te-yvrsk.js", "_next/static/chunks/turbopack-44n63te-yvrsk.js"),
    ("/_next/static/chunks/turbopack-worker-1hrsqshz0gfey.js", "_next/static/chunks/turbopack-worker-1hrsqshz0gfey.js"),
    ("/_next/static/jlJxDVXOGqYBFxvhzqLZ0/_buildManifest.js", "_next/static/jlJxDVXOGqYBFxvhzqLZ0/_buildManifest.js"),
    ("/_next/static/jlJxDVXOGqYBFxvhzqLZ0/_ssgManifest.js", "_next/static/jlJxDVXOGqYBFxvhzqLZ0/_ssgManifest.js"),

    # CSS Fonts & Media
    ("/_next/static/media/07c7676b89ed2778-s.p.2bn3s6zvc0dyp.woff2", "_next/static/media/07c7676b89ed2778-s.p.2bn3s6zvc0dyp.woff2"),
    ("/_next/static/media/2fb76073e23fd9e4-s.3lvt2whj97whp.woff2", "_next/static/media/2fb76073e23fd9e4-s.3lvt2whj97whp.woff2"),
    ("/_next/static/media/3084de8c06b4aa35-s.44izq0ia6orkf.woff2", "_next/static/media/3084de8c06b4aa35-s.44izq0ia6orkf.woff2"),
    ("/_next/static/media/3382ae7d1c882f43-s.0we3rzhp_h228.woff2", "_next/static/media/3382ae7d1c882f43-s.0we3rzhp_h228.woff2"),
    ("/_next/static/media/34c58fc38e31639a-s.p.1s123piy9_v1m.woff2", "_next/static/media/34c58fc38e31639a-s.p.1s123piy9_v1m.woff2"),
    ("/_next/static/media/45462fd7b7c12654-s.0k62hbripvv8p.woff2", "_next/static/media/45462fd7b7c12654-s.0k62hbripvv8p.woff2"),
    ("/_next/static/media/46a9e2f250689b4a-s.0-dom-5bn10r2.woff2", "_next/static/media/46a9e2f250689b4a-s.0-dom-5bn10r2.woff2"),
    ("/_next/static/media/6131cbbf5549afa2-s.2uwcyprjm3xu3.woff2", "_next/static/media/6131cbbf5549afa2-s.2uwcyprjm3xu3.woff2"),
    ("/_next/static/media/707978d2a38e183d-s.p.1w_qz2ahumqmz.woff2", "_next/static/media/707978d2a38e183d-s.p.1w_qz2ahumqmz.woff2"),
    ("/_next/static/media/7081c0a9d77d68b2-s.1hiu0hj9qpr9g.woff2", "_next/static/media/7081c0a9d77d68b2-s.1hiu0hj9qpr9g.woff2"),
    ("/_next/static/media/76b70a1dbe058eb5-s.1y4-pdgsjb-pw.woff2", "_next/static/media/76b70a1dbe058eb5-s.1y4-pdgsjb-pw.woff2"),
    ("/_next/static/media/77b28ce38026b284-s.0fuxtgzazslqx.woff2", "_next/static/media/77b28ce38026b284-s.0fuxtgzazslqx.woff2"),
    ("/_next/static/media/ab56636924653a94-s.p.3cik_s2si-ft-.woff2", "_next/static/media/ab56636924653a94-s.p.3cik_s2si-ft-.woff2"),
    ("/_next/static/media/ba63f6a0e436df8e-s.3-6t-g6q0vh0a.woff2", "_next/static/media/ba63f6a0e436df8e-s.3-6t-g6q0vh0a.woff2"),
    ("/_next/static/media/c442f25284480cdf-s.451yigaaz_4mg.woff2", "_next/static/media/c442f25284480cdf-s.451yigaaz_4mg.woff2"),
    ("/_next/static/media/textureArrays.worker.3sdrlgr_5zs85.ts", "_next/static/media/textureArrays.worker.3sdrlgr_5zs85.ts"),

    # Fonts
    ("/fonts/BebasNeue-Regular.ttf", "fonts/BebasNeue-Regular.ttf"),
    ("/fonts/InstrumentSerif-Italic.ttf", "fonts/InstrumentSerif-Italic.ttf"),
    ("/fonts/InstrumentSerif-Regular.ttf", "fonts/InstrumentSerif-Regular.ttf"),
    ("/fonts/Inter-Bold.ttf", "fonts/Inter-Bold.ttf"),
    ("/fonts/Inter-Medium.ttf", "fonts/Inter-Medium.ttf"),
    ("/fonts/Inter-Regular.ttf", "fonts/Inter-Regular.ttf"),
    ("/fonts/Inter-SemiBold.ttf", "fonts/Inter-SemiBold.ttf"),
    ("/fonts/Sacramento-Regular.ttf", "fonts/Sacramento-Regular.ttf"),
    ("/fonts/SpaceMono-Bold.ttf", "fonts/SpaceMono-Bold.ttf"),
    ("/fonts/SpaceMono-Regular.ttf", "fonts/SpaceMono-Regular.ttf"),

    # 3D Models (.glb)
    ("/models/cinecam.glb", "models/cinecam.glb"),
    ("/models/paris/bridge.glb", "models/paris/bridge.glb"),
    ("/models/paris/eiffel.glb", "models/paris/eiffel.glb"),
    ("/models/paris/house1.glb", "models/paris/house1.glb"),
    ("/models/paris/house2.glb", "models/paris/house2.glb"),
    ("/models/paris/wheel.glb", "models/paris/wheel.glb"),
    ("/models/people/idle.glb", "models/people/idle.glb"),
    ("/models/people/walk.glb", "models/people/walk.glb"),
    ("/models/rider.glb", "models/rider.glb"),
    ("/models/room/laptop.glb", "models/room/laptop.glb"),
    ("/models/street-bike.glb", "models/street-bike.glb"),
    ("/models/street/brownstones.glb", "models/street/brownstones.glb"),
    ("/models/street/fescape.glb", "models/street/fescape.glb"),
    ("/models/street/hotdog.glb", "models/street/hotdog.glb"),
    ("/models/street/shed.glb", "models/street/shed.glb"),
    ("/models/telescope.glb", "models/telescope.glb"),
    ("/models/traffic.glb", "models/traffic.glb"),
    ("/models/trees/elm1.glb", "models/trees/elm1.glb"),
    ("/models/trees/elm2.glb", "models/trees/elm2.glb"),
    ("/models/trees/elm3.glb", "models/trees/elm3.glb"),
    ("/models/trees/elm4.glb", "models/trees/elm4.glb"),
    ("/models/trees/oak1.glb", "models/trees/oak1.glb"),
    ("/models/trees/oak2.glb", "models/trees/oak2.glb"),
    ("/models/water/riva.glb", "models/water/riva.glb"),
    ("/models/water/statue.glb", "models/water/statue.glb"),
    ("/models/xbot.glb", "models/xbot.glb"),

    # Mobile 3D Models (/models/m/...)
    ("/models/m/people/idle.glb", "models/m/people/idle.glb"),
    ("/models/m/people/walk.glb", "models/m/people/walk.glb"),
    ("/models/m/rider.glb", "models/m/rider.glb"),
    ("/models/m/street/brownstones.glb", "models/m/street/brownstones.glb"),
    ("/models/m/street/fescape.glb", "models/m/street/fescape.glb"),
    ("/models/m/street/hotdog.glb", "models/m/street/hotdog.glb"),
    ("/models/m/street/shed.glb", "models/m/street/shed.glb"),
    ("/models/m/traffic.glb", "models/m/traffic.glb"),
    ("/models/m/trees/elm1.glb", "models/m/trees/elm1.glb"),
    ("/models/m/trees/elm2.glb", "models/m/trees/elm2.glb"),
    ("/models/m/trees/elm3.glb", "models/m/trees/elm3.glb"),
    ("/models/m/trees/elm4.glb", "models/m/trees/elm4.glb"),
    ("/models/m/trees/oak1.glb", "models/m/trees/oak1.glb"),
    ("/models/m/trees/oak2.glb", "models/m/trees/oak2.glb"),

    # City Geometry and Binary Data
    ("/city/buildings.bin", "city/buildings.bin"),
    ("/city/city.json", "city/city.json"),
    ("/city/ground.bin", "city/ground.bin"),
    ("/city/mask.bin", "city/mask.bin"),
    ("/city/nj.bin", "city/nj.bin"),
    ("/city/nj.json", "city/nj.json"),
    ("/city/waterfront.bin", "city/waterfront.bin"),

    # Clouds & Weather Data
    ("/textures/clouds/local_weather.png", "textures/clouds/local_weather.png"),
    ("/textures/clouds/shape.bin", "textures/clouds/shape.bin"),
    ("/textures/clouds/shape_detail.bin", "textures/clouds/shape_detail.bin"),
    ("/textures/clouds/turbulence.png", "textures/clouds/turbulence.png"),

    # Textures
    ("/textures/city/Concrete034_c.jpg", "textures/city/Concrete034_c.jpg"),
    ("/textures/city/Concrete034_nr.jpg", "textures/city/Concrete034_nr.jpg"),
    ("/textures/earth/clouds.jpg", "textures/earth/clouds.jpg"),
    ("/textures/earth/day.jpg", "textures/earth/day.jpg"),
    ("/textures/earth/night.jpg", "textures/earth/night.jpg"),
    ("/textures/earth/normal.jpg", "textures/earth/normal.jpg"),
    ("/textures/earth/spec.jpg", "textures/earth/spec.jpg"),
    ("/textures/moon.jpg", "textures/moon.jpg"),
    ("/textures/moon/grey_c.jpg", "textures/moon/grey_c.jpg"),
    ("/textures/moon/grey_nr.jpg", "textures/moon/grey_nr.jpg"),
    ("/textures/moon/prints_c.jpg", "textures/moon/prints_c.jpg"),
    ("/textures/moon/prints_nr.jpg", "textures/moon/prints_nr.jpg"),
    ("/textures/moon/regolith_c.jpg", "textures/moon/regolith_c.jpg"),
    ("/textures/moon/regolith_nr.jpg", "textures/moon/regolith_nr.jpg"),
    ("/textures/room/floor_c.jpg", "textures/room/floor_c.jpg"),
    ("/textures/room/floor_nr.jpg", "textures/room/floor_nr.jpg"),
    ("/textures/room/marble_c.jpg", "textures/room/marble_c.jpg"),
    ("/textures/room/marble_nr.jpg", "textures/room/marble_nr.jpg"),
    ("/textures/room/plaster_c.jpg", "textures/room/plaster_c.jpg"),
    ("/textures/room/plaster_nr.jpg", "textures/room/plaster_nr.jpg"),
    ("/textures/room/rug_c.jpg", "textures/room/rug_c.jpg"),
    ("/textures/room/rug_nr.jpg", "textures/room/rug_nr.jpg"),
    ("/textures/room/terrace_c.jpg", "textures/room/terrace_c.jpg"),
    ("/textures/room/terrace_nr.jpg", "textures/room/terrace_nr.jpg"),
    ("/textures/room/walnut_c.jpg", "textures/room/walnut_c.jpg"),
    ("/textures/room/walnut_dark_c.jpg", "textures/room/walnut_dark_c.jpg"),
    ("/textures/room/walnut_dark_nr.jpg", "textures/room/walnut_dark_nr.jpg"),
    ("/textures/room/walnut_nr.jpg", "textures/room/walnut_nr.jpg"),
    ("/textures/trees/street_albedo.webp", "textures/trees/street_albedo.webp"),
    ("/textures/trees/street_normal.webp", "textures/trees/street_normal.webp"),
    ("/textures/trees/elm1_albedo.webp", "textures/trees/elm1_albedo.webp"),
    ("/textures/trees/elm1_normal.webp", "textures/trees/elm1_normal.webp"),
    ("/textures/trees/elm2_albedo.webp", "textures/trees/elm2_albedo.webp"),
    ("/textures/trees/elm2_normal.webp", "textures/trees/elm2_normal.webp"),
    ("/textures/trees/elm3_albedo.webp", "textures/trees/elm3_albedo.webp"),
    ("/textures/trees/elm3_normal.webp", "textures/trees/elm3_normal.webp"),
    ("/textures/trees/elm4_albedo.webp", "textures/trees/elm4_albedo.webp"),
    ("/textures/trees/elm4_normal.webp", "textures/trees/elm4_normal.webp"),
    ("/textures/trees/oak1_albedo.webp", "textures/trees/oak1_albedo.webp"),
    ("/textures/trees/oak1_normal.webp", "textures/trees/oak1_normal.webp"),
    ("/textures/trees/oak2_albedo.webp", "textures/trees/oak2_albedo.webp"),
    ("/textures/trees/oak2_normal.webp", "textures/trees/oak2_normal.webp"),
    ("/textures/water/detail.png", "textures/water/detail.png"),

    # API response cache
    ("/api/slots", "api/slots.json"),
]

# Add Reels (10 JPGs + 10 MP4s)
REELS = [
    "Danle3qs14E", "DdtucLfT7K9", "Da43skIvHz_", "DanNqLLSIFp",
    "DUs8Ai1CTsF", "DS7sfwhjj7i", "DVSLqO-iZPZ", "DVQFJLLiRlU",
    "DGXgCHERsfG", "DVs-hqTieDq"
]
for r in REELS:
    URL_LIST.append((f"/reels/{r}.jpg", f"reels/{r}.jpg"))
    URL_LIST.append((f"/reels/{r}.mp4", f"reels/{r}.mp4"))

def download_file(item):
    url_path, local_rel_path = item
    local_path = os.path.join(TARGET_DIR, local_rel_path)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    
    # If already downloaded and size > 0, skip
    if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
        return (url_path, "ALREADY_EXISTS", os.path.getsize(local_path))
        
    full_url = BASE_URL + url_path
    req = urllib.request.Request(full_url, headers=HEADERS)
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                with open(local_path, "wb") as f:
                    f.write(data)
                return (url_path, "DOWNLOADED", len(data))
        except Exception as e:
            if attempt == max_retries - 1:
                return (url_path, f"FAILED: {e}", 0)
            time.sleep(1)

def main():
    print(f"Total files to download: {len(URL_LIST)}")
    os.makedirs(TARGET_DIR, exist_ok=True)
    
    start_time = time.time()
    success = 0
    failed = []
    total_bytes = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        future_to_item = {executor.submit(download_file, item): item for item in URL_LIST}
        for future in concurrent.futures.as_completed(future_to_item):
            url_path, status, size = future.result()
            total_bytes += size
            if "DOWNLOADED" in status or "ALREADY_EXISTS" in status:
                success += 1
                if size > 1024 * 1024:
                    print(f"✓ {url_path} ({size / (1024*1024):.2f} MB)")
            else:
                print(f"✗ {url_path} -> {status}")
                failed.append(url_path)

    elapsed = time.time() - start_time
    print("\n--- DOWNLOAD SUMMARY ---")
    print(f"Success: {success}/{len(URL_LIST)}")
    print(f"Total size: {total_bytes / (1024*1024):.2f} MB")
    print(f"Time taken: {elapsed:.1f}s")
    if failed:
        print(f"Failed items ({len(failed)}): {failed}")

if __name__ == "__main__":
    main()
