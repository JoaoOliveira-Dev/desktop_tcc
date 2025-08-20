import path from "path";
import fs from "fs";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import Store from "electron-store";
import { fileURLToPath } from "url";

const isDev = process.env.IS_DEV == "true" ? true : false;
const store = new Store();

let projects = []; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const preloadPath = path.join(__dirname, "preload.js");

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

ipcMain.handle("get-projects", async () => {
  return projects;
});

ipcMain.handle("save-project", async (_, project) => {
  const newProject = { id: Date.now(), ...project };
  projects.push(newProject);
  return projects;
});

ipcMain.handle("edit-project", async (_, id, data) => {
  projects = projects.map((p) => (p.id === id ? { ...p, ...data } : p));
  return projects;
});

ipcMain.handle("delete-project", async (_, id) => {
  projects = projects.filter((p) => p.id !== id);
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
