const path = require("path");
const fs = require("fs");
const os = require("os");
const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const sqlite3 = require("sqlite3").verbose();

const isDev = process.env.IS_DEV === "true";

let db; // conexão com sqlite

function parseJsonArray(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Erro ao interpretar JSON salvo:", error);
    return [];
  }
}

function serializeJsonArray(value) {
  return JSON.stringify(Array.isArray(value) ? value : []);
}

function ensureReportSettingsColumns() {
  db.all("PRAGMA table_info(report_settings)", (err, columns) => {
    if (err) {
      console.error("Erro ao verificar colunas de report_settings:", err);
      return;
    }

    const existingColumns = new Set(columns.map((column) => column.name));

    if (!existingColumns.has("alvos_json")) {
      db.run(
        "ALTER TABLE report_settings ADD COLUMN alvos_json TEXT DEFAULT '[]'"
      );
    }

    if (!existingColumns.has("vulnerabilidades_json")) {
      db.run(
        "ALTER TABLE report_settings ADD COLUMN vulnerabilidades_json TEXT DEFAULT '[]'"
      );
    }
  });
}

// Inicializa o banco
function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "appdata.sqlite");
  db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

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
        h_response TEXT DEFAULT '',
        status INTEGER DEFAULT NULL,
        body TEXT DEFAULT '',
        response TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS report_settings (
        project_id INTEGER PRIMARY KEY,
        template_id TEXT DEFAULT 'rafa',
        autor_nome TEXT DEFAULT '',
        autor_cargo TEXT DEFAULT '',
        autor_telefone TEXT DEFAULT '',
        autor_email TEXT DEFAULT '',
        alvos_json TEXT DEFAULT '[]',
        vulnerabilidades_json TEXT DEFAULT '[]',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

    ensureReportSettingsColumns();
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
// REPORT SETTINGS
//
ipcMain.handle("get-report-settings", async (_, projectId) => {
  const targetProjectId = Number(projectId);

  if (!Number.isFinite(targetProjectId)) {
    return null;
  }

  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM report_settings WHERE project_id = ?",
      [targetProjectId],
      (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else {
          resolve({
            project_id: row.project_id,
            template_id: row.template_id || "rafa",
            autor_nome: row.autor_nome || "",
            autor_cargo: row.autor_cargo || "",
            autor_telefone: row.autor_telefone || "",
            autor_email: row.autor_email || "",
            alvos: parseJsonArray(row.alvos_json),
            vulnerabilidades: parseJsonArray(row.vulnerabilidades_json),
          });
        }
      }
    );
  });
});

ipcMain.handle("save-report-settings", async (_, settings) => {
  const shouldUpdateAlvos = Object.prototype.hasOwnProperty.call(
    settings,
    "alvos"
  );
  const shouldUpdateVulnerabilidades = Object.prototype.hasOwnProperty.call(
    settings,
    "vulnerabilidades"
  );
  const normalizedSettings = {
    project_id: Number(settings.project_id),
    template_id: settings.template_id || "rafa",
    autor_nome: settings.autor_nome || "",
    autor_cargo: settings.autor_cargo || "",
    autor_telefone: settings.autor_telefone || "",
    autor_email: settings.autor_email || "",
    alvos: shouldUpdateAlvos && Array.isArray(settings.alvos) ? settings.alvos : [],
    vulnerabilidades:
      shouldUpdateVulnerabilidades && Array.isArray(settings.vulnerabilidades)
        ? settings.vulnerabilidades
        : [],
  };

  if (!Number.isFinite(normalizedSettings.project_id)) {
    throw new Error("Projeto inválido para salvar as configurações do relatório.");
  }

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE report_settings
       SET template_id = ?,
           autor_nome = ?,
           autor_cargo = ?,
           autor_telefone = ?,
           autor_email = ?,
           alvos_json = COALESCE(?, alvos_json),
           vulnerabilidades_json = COALESCE(?, vulnerabilidades_json),
           updated_at = CURRENT_TIMESTAMP
       WHERE project_id = ?`,
      [
        normalizedSettings.template_id,
        normalizedSettings.autor_nome,
        normalizedSettings.autor_cargo,
        normalizedSettings.autor_telefone,
        normalizedSettings.autor_email,
        shouldUpdateAlvos ? serializeJsonArray(normalizedSettings.alvos) : null,
        shouldUpdateVulnerabilidades
          ? serializeJsonArray(normalizedSettings.vulnerabilidades)
          : null,
        normalizedSettings.project_id,
      ],
      function (err) {
        if (err) {
          reject(err);
          return;
        }

        if (this.changes > 0) {
          resolve(normalizedSettings);
          return;
        }

        db.run(
          `INSERT INTO report_settings (
            project_id,
            template_id,
            autor_nome,
            autor_cargo,
            autor_telefone,
            autor_email,
            alvos_json,
            vulnerabilidades_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            normalizedSettings.project_id,
            normalizedSettings.template_id,
            normalizedSettings.autor_nome,
            normalizedSettings.autor_cargo,
            normalizedSettings.autor_telefone,
            normalizedSettings.autor_email,
            serializeJsonArray(normalizedSettings.alvos),
            serializeJsonArray(normalizedSettings.vulnerabilidades),
          ],
          (insertErr) => {
            if (insertErr) reject(insertErr);
            else resolve(normalizedSettings);
          }
        );
      }
    );
  });
});

ipcMain.handle("save-html-report-pdf", async (event, { html, filename }) => {
  const parentWindow = BrowserWindow.fromWebContents(event.sender);
  const saveDialogOptions = {
    defaultPath: filename || "relatorio-pentest.pdf",
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  };
  const { canceled, filePath } = parentWindow
    ? await dialog.showSaveDialog(parentWindow, saveDialogOptions)
    : await dialog.showSaveDialog(saveDialogOptions);

  if (canceled || !filePath) {
    return { canceled: true };
  }

  const reportWindow = new BrowserWindow({
    show: false,
    width: 794,
    height: 1123,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  const tempDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "desktop-tcc-report-")
  );
  const tempHtmlPath = path.join(tempDir, "report.html");

  try {
    await fs.promises.writeFile(tempHtmlPath, html, "utf8");
    await reportWindow.loadFile(tempHtmlPath);
    await reportWindow.webContents.executeJavaScript(
      `
        new Promise(async (resolve) => {
          try {
            if (document.fonts && document.fonts.ready) {
              await document.fonts.ready;
            }

            await Promise.all(
              Array.from(document.images).map((image) => {
                if (image.complete) return Promise.resolve();
                return new Promise((imageResolve) => {
                  image.onload = imageResolve;
                  image.onerror = imageResolve;
                });
              })
            );

            requestAnimationFrame(() => requestAnimationFrame(resolve));
          } catch {
            resolve();
          }
        });
      `,
      true
    );

    const pdfData = await reportWindow.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      pageSize: "A4",
      margins: {
        marginType: "none",
      },
    });

    await fs.promises.writeFile(filePath, pdfData);
    return { canceled: false, filePath };
  } finally {
    reportWindow.destroy();
    fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
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
    // MODIFICADO: Adicionado o campo 'response' no INSERT
    db.run(
      `INSERT INTO api_tabs (project_id, name, method, url, headers, body, response, h_response, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tab.project_id,
        tab.name,
        tab.method,
        tab.url,
        tab.headers || null,
        tab.body || null,
        tab.response || null,
        tab.h_response || null,
        tab.status || null,
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
        // MODIFICADO: Removido o JSON.parse. O frontend espera strings puras.
        // O SELECT * já busca a nova coluna 'response' automaticamente.
        resolve(rows);
      }
    });
  });
});

// Atualizar tab
ipcMain.handle("update-api-tab", async (_, tab) => {
  return new Promise((resolve, reject) => {
    // MODIFICADO: Adicionado o campo 'response' no UPDATE
    db.run(
      `UPDATE api_tabs 
       SET name = ?, method = ?, url = ?, headers = ?, body = ?, response = ? , h_response = ?, status = ?
       WHERE id = ?`,
      [
        tab.name,
        tab.method,
        tab.url,
        tab.headers || null,
        tab.body || null,
        tab.response || null,
        tab.h_response || null,
        tab.status || null,
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
