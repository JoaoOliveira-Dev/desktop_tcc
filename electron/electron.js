const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const sqlite3 = require("sqlite3").verbose();

const isDev = process.env.IS_DEV === "true";

let db; // conexão com sqlite

// Inicializa o banco
function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "appdata.sqlite");
  db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          folder TEXT,                
          title TEXT NOT NULL,        
          content TEXT,               
          project_id INTEGER NULL,    
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS api_tabs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NULL,
        name TEXT NOT NULL,
        method TEXT DEFAULT 'GET',
        url TEXT DEFAULT '',
        headers TEXT DEFAULT '',
        body TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  });
}

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.js");

  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 650,
    autoHideMenuBar: true,
    resizable: true,
    icon: path.resolve(__dirname, "../public/logo3.ico"),
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

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

//
// CRUD PROJECTS
//
ipcMain.handle("get-projects", () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM projects", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle("save-project", (event, project) => {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO projects (name) VALUES (?)", [project.name], function (err) {
      if (err) reject(err);
      else {
        db.all("SELECT * FROM projects", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }
    });
  });
});

ipcMain.handle("edit-project", (event, { id, name }) => {
  return new Promise((resolve, reject) => {
    db.run("UPDATE projects SET name = ? WHERE id = ?", [name, id], function (err) {
      if (err) reject(err);
      else {
        db.all("SELECT * FROM projects", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }
    });
  });
});

ipcMain.handle("delete-project", (event, id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM projects WHERE id = ?", [id], function (err) {
      if (err) reject(err);
      else {
        db.all("SELECT * FROM projects", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }
    });
  });
});

//
// CRUD NOTES
//

// Criar nota
ipcMain.handle("create-note", async (_, note) => {

  if (!note.project_id) {
    note.project_id = null;
  }

  console.log("Creating note:", note);

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO notes (project_id, folder, title, content) VALUES (?, ?, ?, ?)`,
      [note.project_id, note.folder, note.title, note.content],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...note });
      }
    );
  });
});

// Listar notas por projeto
ipcMain.handle("get-notes", async (_, projectId) => {
  const targetProjectId = projectId || null;

  const query = `
    SELECT * FROM notes 
    WHERE ${targetProjectId === null ? 'project_id IS NULL' : 'project_id = ?'}
    ORDER BY created_at DESC
  `;

  const params = targetProjectId === null ? [] : [targetProjectId];

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Database error:", err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

// Atualizar nota
ipcMain.handle("update-note", async (_, note) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE notes SET folder = ?, title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [note.folder, note.title, note.content, note.id],
      function (err) {
        if (err) reject(err);
        else resolve(note);
      }
    );
  });
});

// Deletar nota
ipcMain.handle("delete-note", async (_, id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM notes WHERE id = ?`, [id], function (err) {
      if (err) reject(err);
      else resolve(true);
    });
  });
});

//
// CRUD API TABS
//

// Criar tab de API
ipcMain.handle("create-api-tab", async (_, tab) => {
  if (!tab.project_id) {
    tab.project_id = null;
  }

  console.log("Creating API Tab:", tab);

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO api_tabs (project_id, name, method, url, headers, body) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tab.project_id,
        tab.name,
        tab.method,
        tab.url,
        tab.headers ? JSON.stringify(tab.headers) : null,
        tab.body || null,
      ],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...tab });
      }
    );
  });
});

// Listar tabs por projeto
ipcMain.handle("get-api-tabs", async (_, projectId) => {
  const targetProjectId = projectId || null;

  console.log("Fetching API Tabs for projectId:", targetProjectId);

  const query = `
    SELECT * FROM api_tabs 
    WHERE ${targetProjectId === null ? "project_id IS NULL" : "project_id = ?"}
    ORDER BY created_at DESC
  `;

  const params = targetProjectId === null ? [] : [targetProjectId];

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Database error:", err.message);
        reject(err);
      } else {
        // Parse headers JSON
        rows = rows.map((row) => ({
          ...row,
          headers: row.headers ? JSON.parse(row.headers) : null,
        }));
        resolve(rows);
      }
    });
  });
});

// Atualizar tab
ipcMain.handle("update-api-tab", async (_, tab) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE api_tabs 
       SET name = ?, method = ?, url = ?, headers = ?, body = ? 
       WHERE id = ?`,
      [
        tab.name,
        tab.method,
        tab.url,
        tab.headers ? JSON.stringify(tab.headers) : null,
        tab.body || null,
        tab.id,
      ],
      function (err) {
        if (err) reject(err);
        else resolve(tab);
      }
    );
  });
});

// Deletar tab
ipcMain.handle("delete-api-tab", async (_, id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM api_tabs WHERE id = ?`, [id], function (err) {
      if (err) reject(err);
      else resolve(true);
    });
  });
});


//
// App lifecycle
//
app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
