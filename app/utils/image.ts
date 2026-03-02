export const saveSVGtoBase64 = (svgElement: SVGElement): string => {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const encoded = new TextEncoder().encode(svgString);
  let binary = "";
  for (let i = 0; i < encoded.length; i++) {
    binary += String.fromCharCode(encoded[i]);
  }
  return btoa(binary);
};

export const saveSVGtoPngBase64 = (
  svgElement: SVGElement,
  scale = 2
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const base64Data = saveSVGtoBase64(svgElement);
    const dataURI = `data:image/svg+xml;base64,${base64Data}`;

    // Use the element's rendered dimensions for reliable sizing
    const rect = svgElement.getBoundingClientRect();
    const w = Math.round(rect.width * scale);
    const h = Math.round(rect.height * scale);

    if (w === 0 || h === 0) {
      reject(new Error("SVG has zero dimensions"));
      return;
    }

    const image = new Image();
    image.src = dataURI;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }

      ctx.drawImage(image, 0, 0, w, h);
      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => {
      reject(new Error("SVG to image conversion failed"));
    };
  });
};
