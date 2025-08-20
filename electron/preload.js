// Use 'require' em vez de 'import'
const { contextBridge, ipcRenderer } = require("electron");

// O resto do seu código permanece exatamente o mesmo.
const versions = {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron,
};

contextBridge.exposeInMainWorld("electron", {
  getProjects: () => ipcRenderer.invoke("get-projects"),
  saveProject: (project) => ipcRenderer.invoke("save-project", project),
  versions: versions,
});