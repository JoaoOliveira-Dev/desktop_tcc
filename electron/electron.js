import path from "path";
import fs from "fs";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import Store from "electron-store";
import { fileURLToPath } from "url";

const isDev = process.env.IS_DEV == "true" ? true : false;
const store = new Store(); // cria um arquivo JSON automático no disco

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const preloadPath = path.join(__dirname, "preload.js");

console.log("-----------------------------------------");
console.log("DIAGNÓSTICO DE CAMINHO DO PRELOAD:");
console.log(`[1] __dirname resolvido para: ${__dirname}`);
console.log(`[2] Caminho completo do preload calculado: ${preloadPath}`);
console.log(`[3] O arquivo preload existe nesse caminho? -> ${fs.existsSync(preloadPath)}`);
console.log("-----------------------------------------");


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 650,
    autoHideMenuBar: true,
    resizable: true,
    icon: path.resolve(__dirname, 'public/logo3.ico'),
    frame: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  );
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

ipcMain.handle("get-projects", () => {
  return store.get("projects", []);
});

ipcMain.handle("save-project", (_, project) => {
  const projects = store.get("projects", []);
  projects.push(project);
  store.set("projects", projects);
  return projects;
});

app.whenReady().then(async() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
