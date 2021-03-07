const { app, BrowserWindow, Menu } = require("electron");

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
  ] : [])
];

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.allowRendererProcessReuse = true;