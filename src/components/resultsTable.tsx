import { View, Text } from "@react-pdf/renderer";

import { VulnType } from "../types/types";

import { styles } from "@/utils/s_resultsTable";

interface ResultsTableProps {
  vulns: VulnType[];
}

const ResultsTable = ({ vulns }: ResultsTableProps) => {
  // Função para contar as vulnerabilidades por gravidade
  const countVulnsBySeverity = (severity: string) => {
    return vulns.filter((vuln) => vuln.severidade === severity).length;
  };

  return (
    <View style={styles.tableContainer}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        <Text style={styles.resultados}>RESULTADOS</Text>
      </View>
      <View style={styles.table}>
        <Text style={{ fontSize: 12, marginBottom: 10 }}>
          Visão Geral das Descobertas:
        </Text>
        <Text style={{ fontSize: 8, marginBottom: 10 }}>
          As sequências seguintes apresentam as vulnerabilidades e problemas de
          implementação identificados durante o período de testes. As
          descobertas são organizadas de acordo com o grau de gravidade e
          impacto.
        </Text>
        <View style={styles.row}>
          <Text style={styles.headerGravidade}>GRAVIDADE</Text>
          <Text style={styles.headerQuantidade}>QUANTIDADE</Text>
        </View>
        <View key="critical" style={styles.rows}>
          <Text style={styles.cell1}>Critical</Text>
          <Text style={styles.cell2}>{countVulnsBySeverity("Critical")}</Text>
        </View>
        <View key="high" style={styles.rows}>
          <Text style={styles.cell1}>High</Text>
          <Text style={styles.cell2}>{countVulnsBySeverity("High")}</Text>
        </View>
        <View key="medium" style={styles.rows}>
          <Text style={styles.cell1}>Medium</Text>
          <Text style={styles.cell2}>{countVulnsBySeverity("Medium")}</Text>
        </View>
        <View key="low" style={styles.rows}>
          <Text style={styles.cell1}>Low</Text>
          <Text style={styles.cell2}>{countVulnsBySeverity("Low")}</Text>
        </View>
        <View key="info" style={styles.rows}>
          <Text style={styles.cell1}>Info</Text>
          <Text style={styles.cell2}>{countVulnsBySeverity("Info")}</Text>
        </View>
      </View>
    </View>
  );
};

export default ResultsTable;
