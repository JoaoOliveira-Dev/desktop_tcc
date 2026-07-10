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

function richTextToText(value?: string) {
  if (!value) return "";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|ul)>/gi, "\n")
    .replace(/<li>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const VulnTable = ({ vulns }: VulnTableProps) => (
  <View>
    {vulns.map((vuln, index) => (
      <View key={vuln.id || index} style={styles.table}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          Vulnerabilidades Externas
        </Text>
        <Text style={styles.title}>
          {index + 1}. {vuln.titulo || vuln.nome}
        </Text>
        <View style={styles.row}>
          <View style={styles.headerGravidade}>
            <Text>{vuln.categoria || vuln.nome}</Text>
          </View>
          <View style={styles.headerQuantidade}>
            <Text>{vuln.severidade}</Text>
          </View>
        </View>
        <View key="" style={styles.rows}>
          <Text style={styles.cell1}>Categoria</Text>
          <Text style={styles.cell2}>{vuln.categoria || vuln.nome}</Text>
        </View>
        <View key="" style={styles.rows}>
          <Text style={styles.cell1}>Subcategoria</Text>
          <Text style={styles.cell2}>{vuln.subcategoria}</Text>
        </View>
        <View key="" style={styles.rows}>
          <Text style={styles.cell1}>OWASP</Text>
          <Text style={styles.cell2}>{vuln.owasp}</Text>
        </View>
        <View key="" style={styles.rows}>
          <Text style={styles.cell1}>CWE</Text>
          <Text style={styles.cell2}>{vuln.cwe}</Text>
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
        <Text style={styles.content}>{richTextToText(vuln.descVuln)}</Text>
        <Text style={styles.subtitle}>Ativo Afetado:</Text>
        <Text style={styles.content}>{richTextToText(vuln.ativos)}</Text>
        <Text style={styles.subtitle}>Referência:</Text>
        <Text style={styles.content}>{richTextToText(vuln.referencia)}</Text>
        <Text style={styles.subtitle}>Impacto:</Text>
        <Text style={styles.content}>{richTextToText(vuln.impacto)}</Text>
        <Text style={styles.subtitle}>Mitigação / Ação para Reparo:</Text>
        <Text style={styles.content}>{richTextToText(vuln.reparo)}</Text>
        <Text style={styles.subtitle}>Proof Of Concept:</Text>
        <Text style={styles.content}>{richTextToText(vuln.poc)}</Text>
        <Text style={styles.subtitle}>Legenda da PoC:</Text>
        <Text style={styles.content}>{vuln.pocLegenda}</Text>
        <Text style={styles.subtitle}>Re-Test:</Text>
        <Text style={styles.content}>
          {vuln.retestStatus}
          {vuln.retestDescricao
            ? `\n${richTextToText(vuln.retestDescricao)}`
            : ""}
        </Text>
      </View>
    ))}
  </View>
);

export default VulnTable;
