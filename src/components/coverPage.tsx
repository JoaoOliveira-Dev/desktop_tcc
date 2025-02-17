import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  cover: {
    padding: 50,
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
});

const CoverPage = () => (
  <View style={styles.cover}>
    <Text style={styles.title}>Relatório de Pentest</Text>
    <Text style={styles.subtitle}>Escopo e Vulnerabilidades</Text>
    <Text>Data: {new Date().toLocaleDateString()}</Text>
  </View>
);

export default CoverPage;
