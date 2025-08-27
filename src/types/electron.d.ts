export {};

declare global {
  interface Window {
    electron: {
      getProjects: () => Promise<any[]>;
      saveProject: (project: any) => Promise<any[]>;
      editProject: (id: number, data: any) => Promise<any[]>;
      deleteProject: (id: number) => Promise<any[]>;

       // Notes
      getNotes: (note: number | null) => Promise<any[]>;
      saveNote: (note: any) => Promise<any[]>;
      editNote: (id: number, data: any) => Promise<any[]>;
      deleteNote: (id: number) => Promise<any[]>;
    };
  }
}
