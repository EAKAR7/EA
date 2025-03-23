const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");

let mainWindow;

// Ensure app data directory exists
const appDataPath = path.join(
  app.getPath("userData"),
  "PersonelYonetimSistemi",
);
if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true });
}

// Set application name
app.setName("Personel Yönetim Sistemi");

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false,
    },
  });

  // Determine the correct path to the HTML file
  let startUrl;
  const devPath = process.env.ELECTRON_START_URL;

  // In production, resources are in the app.asar file
  const prodPath = path.join(__dirname, "../dist/index.html");
  const resourcesPath = path.join(
    process.resourcesPath,
    "app.asar/dist/index.html",
  );

  // Check if we're in development or production
  if (devPath) {
    startUrl = devPath;
  } else if (fs.existsSync(prodPath)) {
    startUrl = url.format({
      pathname: prodPath,
      protocol: "file:",
      slashes: true,
    });
  } else if (fs.existsSync(resourcesPath)) {
    startUrl = url.format({
      pathname: resourcesPath,
      protocol: "file:",
      slashes: true,
    });
  } else {
    // Fallback path if dist folder is in a different location
    const altPath = path.join(app.getAppPath(), "dist/index.html");
    startUrl = url.format({
      pathname: altPath,
      protocol: "file:",
      slashes: true,
    });
  }

  // Load the app
  mainWindow.loadURL(startUrl);

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Create application menu
  const template = [
    {
      label: "Dosya",
      submenu: [{ role: "quit", label: "Çıkış" }],
    },
    {
      label: "Düzenle",
      submenu: [
        { role: "undo", label: "Geri Al" },
        { role: "redo", label: "Yinele" },
        { type: "separator" },
        { role: "cut", label: "Kes" },
        { role: "copy", label: "Kopyala" },
        { role: "paste", label: "Yapıştır" },
        { role: "delete", label: "Sil" },
        { role: "selectAll", label: "Tümünü Seç" },
      ],
    },
    {
      label: "Görünüm",
      submenu: [
        { role: "reload", label: "Yenile" },
        { role: "toggleDevTools", label: "Geliştirici Araçları" },
        { type: "separator" },
        { role: "resetZoom", label: "Gerçek Boyut" },
        { role: "zoomIn", label: "Yakınlaştır" },
        { role: "zoomOut", label: "Uzaklaştır" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tam Ekran" },
      ],
    },
    {
      label: "Yardım",
      submenu: [
        {
          label: "Hakkında",
          click: () => {
            const { dialog } = require("electron");
            dialog.showMessageBox(mainWindow, {
              title: "Personel Yönetim Sistemi",
              message: "Personel Yönetim Sistemi",
              detail:
                "Sürüm 1.0.0\nVakıf Katılım Bankası\nTeftiş Kurulu Başkanlığı",
              buttons: ["Tamam"],
              icon: path.join(__dirname, "icon.ico"),
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

// Handle app ready event
app.whenReady().then(() => {
  createWindow();

  // On macOS it's common to re-create a window when the dock icon is clicked
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle app activation (removed duplicate code that's now in whenReady)
