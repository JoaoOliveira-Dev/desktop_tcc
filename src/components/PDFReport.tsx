import { Document, Page, View, StyleSheet, Font } from "@react-pdf/renderer";
import CoverPage from "./coverPage";
import ScopeTable from "./scopeTable";
import VulnTable from "./vulnTable";
import SeverityDescriptionsTable from "./severityDescriptionTable"; // Importe o novo componente
import { Alvo, VulnType } from "../types/types";
import ResultsTable from "./resultsTable";

// Registra a fonte Rasa
Font.register({
  family: "Open Sans",
  fonts: [
    { src: "/public/fonts/OpenSans-Regular.ttf" },
    { src: "/public/fonts/OpenSans-Bold.ttf", fontWeight: "bold" },
    { src: "/public/fonts/OpenSans-Italic.ttf", fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Open Sans",
  },
  section: {
    marginBottom: 20,
  },
});

interface PDFReportProps {
  alvos: Alvo[];
  vulns: VulnType[];
}

const PDFReport = ({ alvos, vulns }: PDFReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <CoverPage />
      <View style={styles.section}>
        <h1>ESCOPO</h1>
        <ScopeTable alvos={alvos} />
      </View>
      {/* <View style={styles.section}>
        <VulnTable vulns={vulns} />
      </View> */}
      <View style={styles.section}>
        <h1>RESULTADOS</h1>
        <ResultsTable vulns={vulns} /> {/* Adicione o novo componente */}
      </View>
      <View style={styles.section}>
        <SeverityDescriptionsTable /> {/* Adicione o novo componente */}
      </View>
      <View style={styles.section}>
        <h1>VULNERABILIDADES</h1>
        <VulnTable vulns={vulns} /> {/* Adicione o novo componente */}
      </View>
    </Page>
  </Document>
);

export default PDFReport;
