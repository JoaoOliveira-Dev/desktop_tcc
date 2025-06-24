import { View, Text, StyleSheet } from "@react-pdf/renderer";

// Estilos atualizados com aparência técnica e profissional
const styles = StyleSheet.create({
  cover: {
    padding: 60,
    textAlign: "center",
    fontFamily: "Helvetica",
    backgroundColor: "#f9fafb", // fundo claro
    position: "relative",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#4b5563",
    fontStyle: "italic",
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 10,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
});

// Componente CoverPage com logo e informações centrais
const CoverPage = () => (
  <View style={styles.cover}>
    {/* Placeholder para logo */}
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, color: "#374151" }}>
        Relatório Gerado por:
      </Text>
      <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827" }}>
        Equipe de Segurança
      </Text>
    </View>

    {/* Título principal */}
    <View style={styles.titleContainer}>
      <Text style={styles.title}>Relatório de Pentest</Text>
      <Text style={styles.subtitle}>
        Escopo e Vulnerabilidades Identificadas
      </Text>
    </View>

    {/* Data */}
    <Text style={styles.date}>Data: {new Date().toLocaleDateString()}</Text>

    {/* Rodapé */}
    <View style={styles.footer}>
      <Text>Confidencial — Uso exclusivo interno</Text>
    </View>
  </View>
);

export default CoverPage;
