import { useState } from "react";
import {
  pdf,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Alvo, VulnType } from "../types/types";
import PDFReport from "./PDFReport";

interface PDFReportProps {
  alvos: Alvo[];
  vulns: VulnType[];
}

export default function PDFViewerExample({ alvos, vulns }: PDFReportProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Função para gerar o PDF e criar uma URL
  const generatePDF = async () => {
    const blob = await pdf(<PDFReport alvos={alvos} vulns={vulns} />).toBlob();
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);

    // Abre o PDF em uma nova aba
    window.open(url, "_blank");

    // Limpa a URL após o uso (opcional)
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setPdfUrl(null);
    }, 1000); // Espera 1 segundo antes de limpar a URL
  };

  return (
    <div>
      {/* Botão para gerar o PDF */}
      <Button
        variant="outline"
        onClick={generatePDF}
        style={{ marginBottom: 20 }}
      >
        Gerar PDF
      </Button>
    </div>
  );
}
