export {};

declare global {
  interface Window {
    electron: {
      getProjects: () => Promise<any[]>;
      saveProject: (project: any) => Promise<any[]>;
      editProject: (id: number, data: any) => Promise<any[]>;
      deleteProject: (id: number) => Promise<any[]>;
    };
  }
}
