import { StyleSheet } from "@react-pdf/renderer";
import colors from "@/utils/colors";

export const styles = StyleSheet.create({
  tableContainer: {
    display: "flex",
    alignItems: "center", // Centraliza verticalmente
    justifyContent: "center", // Centraliza horizontalmente
    width: "100%", // Ocupa toda a largura disponível
  },
  table: {
    width: "90%", // Largura da tabela (ajustável)
    marginTop: 10,
    alignSelf: "center", // Centraliza a tabela horizontalmente
  },
  row: {
    flexDirection: "row",
    height: 35,
  },
  rows: {
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    height: 65,
  },
  cellSeverity: {
    flex: 1,
    padding: 5,
    fontSize: 10,
  },
  cellDesc: {
    flex: 3,
    padding: 5,
    fontSize: 10,
  },
  headerGravidade: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
    color: colors.white,
    backgroundColor: colors.red,
  },
  headerDescricao: {
    flex: 3, // Aumenta o tamanho da coluna de descrição
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    color: colors.white,
    backgroundColor: colors.b_blue,
  },
});
