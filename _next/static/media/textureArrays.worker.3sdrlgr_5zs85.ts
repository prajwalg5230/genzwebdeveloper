/// <reference lib="webworker" />

// Packs the city's texture layers into the RGBA stacks a DataArrayTexture uploads,
// off the main thread: fetch, decode, draw each layer once, read it back.
// Rows are flipped while decoding: DataArrayTexture rows start at v = 0.

type Job = { size: number; normalSize: number; color: string[]; normal: string[] };

async function pack(urls: string[], size: number, g: OffscreenCanvasRenderingContext2D) {
  const data = new Uint8Array(size * size * 4 * urls.length);
  const bitmaps = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Could not load ${url}: ${res.status}`);
      const bmp = await createImageBitmap(await res.blob(), {
        imageOrientation: "flipY",
        premultiplyAlpha: "none",
        colorSpaceConversion: "none",
        resizeWidth: size,
        resizeHeight: size,
        resizeQuality: "high",
      });
      self.postMessage({ loaded: url });
      return bmp;
    })
  );
  bitmaps.forEach((bmp, i) => {
    g.clearRect(0, 0, size, size);
    g.drawImage(bmp, 0, 0, size, size);
    data.set(g.getImageData(0, 0, size, size).data, i * size * size * 4);
    bmp.close();
  });
  return data;
}

self.onmessage = async (e: MessageEvent<Job>) => {
  const { size, normalSize, color, normal } = e.data;
  try {
    const g = new OffscreenCanvas(size, size).getContext("2d", { willReadFrequently: true });
    const gn = normalSize === size ? g : new OffscreenCanvas(normalSize, normalSize).getContext("2d", { willReadFrequently: true });
    if (!g || !gn) throw new Error("no 2d context in worker");
    const [c, n] = await Promise.all([pack(color, size, g), pack(normal, normalSize, gn)]);
    self.postMessage({ color: c, normal: n }, [c.buffer, n.buffer]);
  } catch (err) {
    self.postMessage({ error: String(err) });
  }
};
