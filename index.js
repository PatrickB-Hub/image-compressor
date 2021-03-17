const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');

process.env.NODE_ENV = "development"

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Compressor",
    width: isDev ? 800 : 500,
    height: 600,
    resizable: isDev,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    backgroundColor: "#fff",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: true
    }
  });

  // open dev-tools when environment is set to 'development'
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // render index.html in the main Widow
  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About Image Compressor",
    width: 300,
    height: 250,
    resizable: false,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    backgroundColor: "#fff"
  });

  // render the about page in the about window
  aboutWindow.loadURL(`file://${__dirname}/app/about.html`);
}

app.whenReady().then(() => {
  createMainWindow();

  mainWindow.on("closed", () => mainWindow.null);

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

const menu = [
  ...(isMac ? [
    {
      label: app.name,
      submenu: [
        {
          label: "About",
          click: createAboutWindow
        }
      ]
    }
  ] : []),
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: "CmdOrCtrl+Q",
        click: () => app.quit()
      }
    ]
  },
  ...(isDev ? [
    {
      label: "Developer",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "separator" },
        { role: "toggledevtools" }
      ]
    }
  ] : []),
  ...(!isMac ? [
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: createAboutWindow
        }
      ]
    }
  ] : [])
];

ipcMain.on('compress', (_, options) => {
  options.dest = path.join(os.homedir(), 'imagemin')
  compressImages(options)
})

async function compressImages({ imagePaths, quality, dest }) {
  try {
    const pngQuality = quality / 100

    const files = await imagemin(imagePaths.map((path) => slash(path)), {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    })

    log.info(files)

    shell.openPath(dest)

    mainWindow.webContents.send('done')
  } catch (err) {
    log.error(err)
  }
}

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.allowRendererProcessReuse = true;