import { imageBrowserDownload } from './browser';

export let saveSVGtoBase64 = (svgElement) => {
    let serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const base64Data = btoa(unescape(encodeURIComponent(svgString)));

    return base64Data;
};

export let saveSVGtoFile = (svgElement) => {
    const base64Data = saveSVGtoBase64(svgElement);

    const dataURI = `data:image/svg+xml;base64,${base64Data}`;

    imageBrowserDownload(dataURI, 'screenshot.svg');
}

export let saveSVGtoPngBase64 = async (svgElement) => {
    return new Promise((resolve, reject) => {
        const base64Data = saveSVGtoBase64(svgElement);
        const dataURI = `data:image/svg+xml;base64,${base64Data}`;

        let image = new Image();
        image.src = dataURI;

        image.onload = () => {
            let canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;

            let context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);

            let pngDataURI = canvas.toDataURL('image/png');
            let pngBase64Data = pngDataURI.replace(/^data:image\/(png|jpg);base64,/, '');
            resolve(pngBase64Data);
        }

        image.onerror = (err) => {
            reject(new Error('Image loading or conversion failed'));
        }
    });
}

export let saveSVGtoPngFile = (svgElement) => {
    saveSVGtoPngBase64(svgElement)
        .then((pngBase64Data) => {
            let pngDataURI = `data:image/png;base64,${pngBase64Data}`;
            imageBrowserDownload(pngDataURI, 'screenshot.png');
        })
        .catch((err) => {
            console.error(err);
        });
}

