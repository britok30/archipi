type FileExtension = "json" | "obj" | "mtl";

const typeMap: Record<FileExtension, string> = {
  json: "text/plain",
  obj: "model/obj",
  mtl: "model/mtl",
};

function triggerDownload(url: string, filename: string): void {
  const link = document.createElement("a");
  link.setAttribute("download", filename);
  link.href = url;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadDataURI(dataUri: string, filename: string): void {
  triggerDownload(dataUri, filename);
}

export function browserDownloadWithName(
  file: string,
  filename: string,
  ext: FileExtension = "json"
): void {
  if (!typeMap[ext]) return;

  const fullName = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
  const data = new Blob([file], { type: typeMap[ext] });
  const url = URL.createObjectURL(data);
  triggerDownload(url, fullName);
  URL.revokeObjectURL(url);
}

export function browserUpload(): Promise<Record<string, unknown>> {
  return new Promise(function (resolve, reject) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";

    fileInput.addEventListener("change", function (event: Event) {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      if (
        !file.type.match("application/json") &&
        !file.name.endsWith(".json")
      ) {
        reject(new Error("Please select a JSON file"));
        return;
      }

      const reader = new FileReader();
      reader.addEventListener(
        "load",
        (fileEvent: ProgressEvent<FileReader>) => {
          try {
            const fileContent = fileEvent.target?.result as string;
            const parsedData = JSON.parse(fileContent);
            resolve(parsedData || {});
          } catch (error) {
            console.error("JSON Parse Error:", error);
            reject(
              new Error(`Invalid JSON file: ${(error as Error).message}`)
            );
          }
        }
      );

      reader.addEventListener("error", () => {
        reject(new Error("Error reading file"));
      });

      reader.readAsText(file);
    });

    fileInput.click();
  });
}
