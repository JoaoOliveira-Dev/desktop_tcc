import type { Alvo, VulnType } from "./types";

export {};

declare global {
  interface Window {
    electron: {
      getProjects: () => Promise<any[]>;
      saveProject: (project: any) => Promise<any[]>;
      editProject: (id: number, data: any) => Promise<any[]>;
      deleteProject: (id: number) => Promise<any[]>;

      // Report Settings
      getReportSettings: (projectId: number) => Promise<ReportSettings | null>;
      saveReportSettings: (
        settings: ReportSettings
      ) => Promise<ReportSettings>;
      saveHtmlReportPdf?: (
        html: string,
        filename: string
      ) => Promise<{ canceled: boolean; filePath?: string }>;

      // Notes
      getNotes: (projectId: number | null) => Promise<Note[]>; // lista de notas
      createNote: (note: Omit<Note, "id">) => Promise<Note>; // retorna a nota criada
      updateNote: (note: Note) => Promise<Note>; // retorna a nota atualizada
      deleteNote: (id: number) => Promise<void>; // só deleta

      // Tabs
      getApiTabs: (projectId?: number | null) => Promise<ApiTab[]>;
      createApiTab: (tab: Omit<ApiTab, "id">) => Promise<ApiTab>;
      updateApiTab: (tab: ApiTab) => Promise<ApiTab>;
      deleteApiTab: (id: number) => Promise<void>;
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

  interface ApiTab {
    id: number;
    project_id: number | null;
    name: string;
    method: string;
    url: string;
    headers: string;
    body: string;
    response: string | null;
    h_response: string | null;
    status: number | null;
  }

  interface ReportSettings {
    project_id: number;
    template_id: string;
    autor_nome: string;
    autor_cargo: string;
    autor_telefone: string;
    autor_email: string;
    alvos?: Alvo[];
    vulnerabilidades?: VulnType[];
  }
}
