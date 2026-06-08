import { Alvo, VulnType } from "@/types/types";
import { ReportData } from "@/lib/pdfProcessor";

type Severity = "critical" | "high" | "medium" | "low" | "info";

const severityMap: Record<string, Severity> = {
  critical: "critical",
  critico: "critical",
  crítico: "critical",
  high: "high",
  alto: "high",
  medium: "medium",
  medio: "medium",
  médio: "medium",
  low: "low",
  baixo: "low",
  info: "info",
  informational: "info",
  informacional: "info",
};

export function normalizeSeverity(value?: string | null): Severity {
  if (!value) return "info";
  return severityMap[value.toLowerCase().trim()] ?? "info";
}

export function buildCvssVector(vuln: VulnType) {
  if (!vuln.cvssData) return "";

  const {
    attackVector,
    attackComplexity,
    privilegesRequired,
    userInteraction,
    scope,
    confidentialityImpact,
    integrityImpact,
    availabilityImpact,
  } = vuln.cvssData;

  return `CVSS:3.1/AV:${attackVector}/AC:${attackComplexity}/PR:${privilegesRequired}/UI:${userInteraction}/S:${scope}/C:${confidentialityImpact}/I:${integrityImpact}/A:${availabilityImpact}`;
}

export function createReportDataFromManualInput(
  alvos: Alvo[],
  vulns: VulnType[],
  projectName?: string
): ReportData {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  vulns.forEach((vuln) => {
    counts[normalizeSeverity(vuln.severidade)] += 1;
  });

  const totalVulns = vulns.length;
  const firstTarget = alvos[0]?.link ?? "";

  return {
    nome_empresa: projectName || "Projeto de Pentest",
    dominio_empresa: firstTarget,
    data_relatorio: new Date().toISOString().slice(0, 10),
    escopo_descricao:
      alvos.length > 0
        ? `O escopo do pentest contemplou ${alvos.length} alvo(s) informado(s) pelo usuário.`
        : "Escopo não informado.",
    resumo_executivo:
      totalVulns > 0
        ? `Foram registradas ${totalVulns} vulnerabilidade(s) durante a avaliação, organizadas por gravidade e impacto.`
        : "Nenhuma vulnerabilidade foi registrada até o momento.",
    total_critical: counts.critical,
    total_high: counts.high,
    total_medium: counts.medium,
    total_low: counts.low,
    total_info: counts.info,
    alvos: alvos.map((alvo, index) => ({
      url: alvo.link,
      login: "",
      descricao: String(index + 1).padStart(2, "0"),
    })),
    vulnerabilidades: vulns.map((vuln, index) => ({
      titulo: `${index + 1}. ${vuln.nome}`,
      categoria: vuln.nome,
      severidade: normalizeSeverity(vuln.severidade),
      cvss_score: vuln.cvssData?.score ?? "",
      cvss_vector: buildCvssVector(vuln),
      descricao: vuln.descVuln,
      ativo_afetado: vuln.ativos,
      impacto: vuln.impacto,
      recomendacao: vuln.reparo,
      referencias: richTextToPlainText(vuln.referencia)
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      cwe: [],
      poc_descricao: vuln.poc,
      poc_codigo: "",
    })),
    evidencias: [],
    autor_nome: "",
    autor_cargo: "",
    autor_telefone: "",
    autor_email: "",
  };
}

function richTextToPlainText(value: string) {
  if (typeof document === "undefined") {
    return value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "");
  }

  const container = document.createElement("div");
  container.innerHTML = value;

  container.querySelectorAll("br").forEach((br) => {
    br.replaceWith("\n");
  });

  container.querySelectorAll("div, p, li").forEach((element) => {
    element.appendChild(document.createTextNode("\n"));
  });

  return (container.textContent ?? "").trim();
}
