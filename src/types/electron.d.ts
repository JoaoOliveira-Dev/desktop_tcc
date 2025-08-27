export {};

declare global {
  interface Window {
    electron: {
      getProjects: () => Promise<any[]>;
      saveProject: (project: any) => Promise<any[]>;
      editProject: (id: number, data: any) => Promise<any[]>;
      deleteProject: (id: number) => Promise<any[]>;

      // Notes
      getNotes: (projectId: number | null) => Promise<Note[]>;  // lista de notas
      createNote: (note: Omit<Note, "id">) => Promise<Note>;    // retorna a nota criada
      updateNote: (note: Note) => Promise<Note>;                // retorna a nota atualizada
      deleteNote: (id: number) => Promise<void>;                // só deleta
    };
  }

  // Garante que Note esteja disponível globalmente também
  interface Note {
    id: number;
    project_id: number | null;
    folder: string;
    title: string;
    content: string;
  }
}
