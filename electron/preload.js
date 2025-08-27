const { contextBridge, ipcRenderer } = require("electron");

const versions = {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron,
};

contextBridge.exposeInMainWorld("electron", {
  getProjects: () => ipcRenderer.invoke("get-projects"),
  saveProject: (project) => ipcRenderer.invoke("save-project", project),
  editProject: (id, data) => ipcRenderer.invoke("edit-project", id, data),
  deleteProject: (id) => ipcRenderer.invoke("delete-project", id),

  // Notes
  getNotes: () => ipcRenderer.invoke("get-notes"),
  getNotesNull: () => ipcRenderer.invoke("get-notes-null"),
  saveNote: (note) => ipcRenderer.invoke("save-note", note),
  editNote: (id, data) => ipcRenderer.invoke("edit-note", id, data),
  deleteNote: (id) => ipcRenderer.invoke("delete-note", id),
  versions: versions,
});