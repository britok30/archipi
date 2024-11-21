import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

export function browserDownload(file, ext = "json") {
  const typeMap = { json: "text/plain", obj: "model/obj", mtl: "model/mtl	" };

  if (!typeMap[ext]) return;

  let fileOutputLink = document.createElement("a");

  let filename = "output" + Date.now() + "." + ext;
  filename = window.prompt("Insert output filename", filename);
  if (!filename) return;

  let data = null;

  data = new Blob([file], { type: typeMap[ext] });

  let url = window.URL.createObjectURL(data);
  fileOutputLink.setAttribute("download", filename);
  fileOutputLink.href = url;
  fileOutputLink.style.display = "none";
  document.body.appendChild(fileOutputLink);
  fileOutputLink.click();
  document.body.removeChild(fileOutputLink);
}

export function imageBrowserDownload(imageUri, filename) {
  let fileOutputLink = document.createElement("a");

  filename = window.prompt("Insert output filename", filename);
  if (!filename) return;

  fileOutputLink.setAttribute("download", filename);
  fileOutputLink.href = imageUri;
  fileOutputLink.style.display = "none";
  document.body.appendChild(fileOutputLink);
  fileOutputLink.click();
  document.body.removeChild(fileOutputLink);
}

export function browserUpload() {
  return new Promise(function (resolve, reject) {
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";

    fileInput.addEventListener("change", function (event) {
      let file = event.target.files[0];

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

      let reader = new FileReader();
      reader.addEventListener("load", (fileEvent) => {
        try {
          let fileContent = fileEvent.target.result;
          let parsedData = JSON.parse(fileContent);
          resolve(parsedData || {});
        } catch (error) {
          console.error("JSON Parse Error:", error);
          reject(new Error(`Invalid JSON file: ${error.message}`));
        }
      });

      reader.addEventListener("error", () => {
        reject(new Error("Error reading file"));
      });

      reader.readAsText(file);
    });

    fileInput.click();
  });
}
