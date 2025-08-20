export {};

declare global {
  interface Window {
    electron: {
      getProjects: () => Promise<any[]>;
      saveProject: (project: any) => Promise<any[]>;
    };
  }
}
