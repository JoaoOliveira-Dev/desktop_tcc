export type ReportTemplateId = "default" | "rafa";

export type ReportTemplate = {
  id: ReportTemplateId;
  name: string;
  description: string;
  path: string;
};

export const reportTemplates: ReportTemplate[] = [
  {
    id: "rafa",
    name: "Rafa / OSTEC",
    description: "Estrutura visual baseada no REPORT PARCIAL PENTEST.",
    path: "/generate_report/report-rafa.html",
  },
  {
    id: "default",
    name: "Padrão",
    description: "Template HTML padrão do gerador de relatório.",
    path: "/generate_report/report.html",
  },
];

export function getReportTemplate(templateId: string) {
  return (
    reportTemplates.find((template) => template.id === templateId) ??
    reportTemplates[0]
  );
}
