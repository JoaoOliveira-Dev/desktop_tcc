import { View, Text } from "@react-pdf/renderer";

import { Alvo } from "../types/types";

import { styles } from "@/utils/s_scopeTable";

interface ScopeTableProps {
  alvos: Alvo[];
}

const ScopeTable = ({ alvos }: ScopeTableProps) => (
  <View style={styles.tableContainer}>
    {/* Adicionando o texto "ESCOPO" */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        width: "100%",
      }}
    >
      <Text style={styles.escopo}>ESCOPO</Text>
    </View>
    <View style={styles.table}>
      {/* Cabeçalho da tabela */}
      <View style={styles.row}>
        <Text style={styles.headerAlvo}>ALVO</Text>
        <Text style={styles.headerLink}>LINK/LOGIN/SENHA</Text>
      </View>
      {/* Linhas da tabela */}
      {alvos.map((alvo, index) => (
        <View key={alvo.id} style={styles.rows}>
          <Text style={styles.cell1}>{String(index + 1).padStart(2, "0")}</Text>
          <Text style={styles.cell2}>{alvo.link}</Text>
        </View>
      ))}
    </View>
  </View>
);

export default ScopeTable;
