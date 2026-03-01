import { imageBrowserDownload } from './browser';

export const saveSVGtoBase64 = (svgElement: SVGElement): string => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const base64Data = btoa(unescape(encodeURIComponent(svgString)));

    return base64Data;
};

export const saveSVGtoFile = (svgElement: SVGElement): void => {
    const base64Data = saveSVGtoBase64(svgElement);

    const dataURI = `data:image/svg+xml;base64,${base64Data}`;

    imageBrowserDownload(dataURI, 'screenshot.svg');
};

export const saveSVGtoPngBase64 = async (svgElement: SVGElement): Promise<string> => {
    return new Promise((resolve, reject) => {
        const base64Data = saveSVGtoBase64(svgElement);
        const dataURI = `data:image/svg+xml;base64,${base64Data}`;

        const image = new Image();
        image.src = dataURI;

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;

            const context = canvas.getContext('2d');
            context!.drawImage(image, 0, 0);

            const pngDataURI = canvas.toDataURL('image/png');
            const pngBase64Data = pngDataURI.replace(/^data:image\/(png|jpg);base64,/, '');
            resolve(pngBase64Data);
        };

        image.onerror = () => {
            reject(new Error('Image loading or conversion failed'));
        };
    });
};

export const saveSVGtoPngFile = (svgElement: SVGElement): void => {
    saveSVGtoPngBase64(svgElement)
        .then((pngBase64Data: string) => {
            const pngDataURI = `data:image/png;base64,${pngBase64Data}`;
            imageBrowserDownload(pngDataURI, 'screenshot.png');
        })
        .catch((err: Error) => {
            console.error(err);
        });
};
