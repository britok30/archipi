type FileExtension = 'json' | 'obj' | 'mtl';

const typeMap: Record<FileExtension, string> = {
  json: 'text/plain',
  obj: 'model/obj',
  mtl: 'model/mtl'
};

export function browserDownload(file: string, ext: FileExtension = 'json'): void {
  if (!typeMap[ext]) return;

  const fileOutputLink = document.createElement('a');

  let filename: string | null = 'output' + Date.now() + '.' + ext;
  filename = window.prompt('Insert output filename', filename);
  if (!filename) return;

  const data = new Blob([file], { type: typeMap[ext] });

  const url = window.URL.createObjectURL(data);
  fileOutputLink.setAttribute('download', filename);
  fileOutputLink.href = url;
  fileOutputLink.style.display = 'none';
  document.body.appendChild(fileOutputLink);
  fileOutputLink.click();
  document.body.removeChild(fileOutputLink);
}

export function imageBrowserDownload(imageUri: string, filename: string = 'output'): void {
  const fileOutputLink = document.createElement('a');

  const finalFilename = window.prompt('Insert output filename', filename);
  if (!finalFilename) return;

  fileOutputLink.setAttribute('download', finalFilename);
  fileOutputLink.href = imageUri;
  fileOutputLink.style.display = 'none';
  document.body.appendChild(fileOutputLink);
  fileOutputLink.click();
  document.body.removeChild(fileOutputLink);
}

export function browserUpload(): Promise<Record<string, unknown>> {
  return new Promise(function (resolve, reject) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';

    fileInput.addEventListener('change', function (event: Event) {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      if (
        !file.type.match('application/json') &&
        !file.name.endsWith('.json')
      ) {
        reject(new Error('Please select a JSON file'));
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', (fileEvent: ProgressEvent<FileReader>) => {
        try {
          const fileContent = fileEvent.target?.result as string;
          const parsedData = JSON.parse(fileContent);
          resolve(parsedData || {});
        } catch (error) {
          console.error('JSON Parse Error:', error);
          reject(new Error(`Invalid JSON file: ${(error as Error).message}`));
        }
      });

      reader.addEventListener('error', () => {
        reject(new Error('Error reading file'));
      });

      reader.readAsText(file);
    });

    fileInput.click();
  });
}
