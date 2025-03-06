import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";

import PDFReport from "../components/PDFReport";
import PDFView from "../components/PDFView";
import Scope from "../components/scope";
import Vuln from "../components/vuln";

import { Card } from "@/components/ui/card";

import { Alvo, VulnType } from "../types/types";
import { cn } from "@/lib/utils";

export default function Report() {
  const [alvos, setAlvos] = useState<Alvo[]>([]);
  const [vulns, setVulns] = useState<VulnType[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // Função para adicionar ou atualizar vulnerabilidades
  const handleAddOrUpdateVulnerability = (vulnerability: VulnType) => {
    const existingIndex = vulns.findIndex((v) => v.id === vulnerability.id);
    if (existingIndex !== -1) {
      // Atualiza a vulnerabilidade existente
      const updatedVulns = [...vulns];
      updatedVulns[existingIndex] = vulnerability;
      setVulns((prevVulns) => [...prevVulns, vulnerability]);
    } else {
      // Adiciona uma nova vulnerabilidade
      setVulns([...vulns, vulnerability]);
    }
  };

  return (
    <div className={cn(
          "border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        )}>
      {/* <NavBar /> */}
      <Card className="p-8 max-w-3xl mx-auto mt-3">
        <Scope alvos={alvos} setAlvos={setAlvos} />
        <Vuln onAddOrUpdateVulnerability={handleAddOrUpdateVulnerability} vulns={vulns} setVulns={setVulns} />
        
        {/* Botões de Ação */}
        <div className="flex justify-between mt-6">
          {/* <Button onClick={clearVulnerabilities} variant="destructive">
            Limpar Vulnerabilidades
          </Button> */}

          <PDFDownloadLink
            document={<PDFReport alvos={alvos} vulns={vulns} />}
            fileName="pentest_report.pdf"
          >
            {({ loading }) => (
              <button className="bg-green-500 text-white px-4 py-2">
                {loading ? "Gerando PDF..." : "Baixar Relatório PDF"}
              </button>
            )}
          </PDFDownloadLink>

          <PDFView alvos={alvos} vulns={vulns} />
        </div>
      </Card>
    </div>
  );
}
