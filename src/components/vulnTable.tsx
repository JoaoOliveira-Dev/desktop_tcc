import { View, Text } from "@react-pdf/renderer";
import { VulnType } from "../types/types";
import { styles } from "@/utils/s_vulns";

// const styles = StyleSheet.create({
//   section: {
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginTop: 10,
//   },
//   subtitle: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: "#3b82f6",
//     marginTop: 5,
//   },
//   table: {
//     width: "100%",
//     marginTop: 10,
//   },
//   row: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderBottomColor: "#000",
//     borderStyle: "solid",
//   },
//   cell: {
//     flex: 1,
//     padding: 5,
//     fontSize: 10,
//     borderRightWidth: 1,
//     borderRightColor: "#000",
//     borderStyle: "solid",
//   },
//   headerID: {
//     flex: 1,
//     padding: 5,
//     fontSize: 10,
//     fontWeight: "bold",
//     backgroundColor: "#ef4444",
//     borderRightWidth: 1,
//     borderRightColor: "#000",
//     borderStyle: "solid",
//   },
//   headerVuln: {
//     flex: 1,
//     padding: 5,
//     fontSize: 10,
//     fontWeight: "bold",
//     backgroundColor: "#3b82f6",
//     borderRightWidth: 1,
//     borderRightColor: "#000",
//     borderStyle: "solid",
//   },
// });

interface VulnTableProps {
  vulns: VulnType[];
}

const VulnTable = ({ vulns }: VulnTableProps) => (
  <View>
    {vulns.map((vuln, index) => (
      <View key={vuln.id || index} style={styles.table}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          Vulnerabilidades Externas
        </Text>
        <Text style={styles.title}>
          {index + 1}. {vuln.nome}
        </Text>
        <View style={styles.row}>
          <View style={styles.headerGravidade}>
            <Text>{vuln.nome}</Text>
          </View>
          <View style={styles.headerQuantidade}>
            <Text>{vuln.severidade}</Text>
          </View>
        </View>
        <View key="" style={styles.rows}>
          <Text style={styles.cell1}>CVSS Points</Text>
          <Text style={styles.cell2}>{vuln.cvssData?.score}</Text>
        </View>
        <View key="" style={styles.rows}>
          <Text style={styles.cell1}>Vetores</Text>
          <Text style={styles.cell2}>
            CVSS:3.1/AV:{vuln.cvssData?.attackVector}/AC:{vuln.cvssData?.attackComplexity}/PR:{vuln.cvssData?.privilegesRequired}/UI:{vuln.cvssData?.userInteraction}/S:{vuln.cvssData?.scope}/C:{vuln.cvssData?.confidentialityImpact}/I:{vuln.cvssData?.integrityImpact}/A:{vuln.cvssData?.availabilityImpact}
          </Text>
        </View>

        <Text style={styles.subtitle}>Descrição da Vulnerabilidade:</Text>
        <Text style={styles.content}>{vuln.descVuln}</Text>
        <Text style={styles.subtitle}>Ativo Afetado:</Text>
        <Text style={styles.content}>{vuln.ativos}</Text>
        <Text style={styles.subtitle}>Referência:</Text>
        <Text style={styles.content}>{vuln.referencia}</Text>
        <Text style={styles.subtitle}>Impacto:</Text>
        <Text style={styles.content}>{vuln.impacto}</Text>
        <Text style={styles.subtitle}>Ação para Reparo:</Text>
        <Text style={styles.content}>{vuln.reparo}</Text>
        <Text style={styles.subtitle}>Proof Of Concept:</Text>
        <Text style={styles.content}>{vuln.poc}</Text>
      </View>
    ))}
  </View>
);

export default VulnTable;
