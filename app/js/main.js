const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");

const fileSizeTypes = ["B", "KB", "MB", "GB", "TB"];

let imageFiles = [];
let quality = 50;

function handleFiles() {
  return {
    files: [],

    readableFileSize(size) {
      const i = Math.floor(Math.log(size) / Math.log(1024));

      return `${(size / Math.pow(1024, i)).toFixed(2)} ${fileSizeTypes[i]}`;
    },

    remove(index) {
      let files = [...this.files];
      files.splice(index, 1);

      this.files = createFileList(files);
      imageFiles = [...files];
    },

    loadFile(file) {
      const preview = document.querySelectorAll(".preview");
      const blobUrl = URL.createObjectURL(file);

      preview.forEach((elem) => {
        elem.onload = () => {
          URL.revokeObjectURL(elem.src); // free memory
        };
      });

      return blobUrl;
    },

    addFiles(e) {
      const files = createFileList([...this.files], [...e.target.files]);
      this.files = files;
      imageFiles = [...files];
    },
  };
}

function handleRange() {
  return {
    min: 0,
    max: 100,
    value: quality,
    sliderLength: 100,

    trigger() {
      this.sliderLength = this.max - this.value;
      quality = this.value;
    },
  };
}

const form = document.getElementById("image-form");
const outputPath = document.getElementById("output-path");

outputPath.innerText = path.join(os.homedir(), "imagemin");

// On submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (imageFiles.length > 0) {
    const imagePaths = imageFiles.map((image) => image.path);

    ipcRenderer.send("compress", {
      imagePaths,
      quality,
    });
  }
});

// On done
ipcRenderer.on("done", () => {
  console.log("finished compressing images");
});
