import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { CVSSCalculatorProps } from "../types/types"

// Definição dos tipos para os pesos
interface Weights {
  AV: { N: number; A: number; L: number; P: number };
  AC: { L: number; H: number };
  PR: {
    U: { N: number; L: number; H: number };
    C: { N: number; L: number; H: number };
  };
  UI: { N: number; R: number };
  S: { U: number; C: number };
  C: { N: number; L: number; H: number };
  I: { N: number; L: number; H: number };
  A: { N: number; L: number; H: number };
}

// Função principal para calcular a pontuação CVSS
function CVSSCalculator({ onCalculate }: CVSSCalculatorProps) {
  // Variáveis para armazenar os valores selecionados
  let version: "3.0" | "3.1" = "3.1";
  let attackVector: "N" | "A" | "L" | "P" = "N";
  let attackComplexity: "L" | "H" = "L";
  let privilegesRequired: "N" | "L" | "H" = "N";
  let userInteraction: "N" | "R" = "N";
  let scope: "U" | "C" = "U";
  let confidentialityImpact: "N" | "L" | "H" = "H";
  let integrityImpact: "N" | "L" | "H" = "H";
  let availabilityImpact: "N" | "L" | "H" = "H";

  // Definição dos pesos com tipos explícitos
  const weights: Weights = {
    AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
    AC: { L: 0.77, H: 0.44 },
    PR: {
      U: { N: 0.85, L: 0.62, H: 0.27 },
      C: { N: 0.85, L: 0.68, H: 0.5 },
    },
    UI: { N: 0.85, R: 0.62 },
    S: { U: 6.42, C: 7.52 },
    C: { N: 0, L: 0.22, H: 0.56 },
    I: { N: 0, L: 0.22, H: 0.56 },
    A: { N: 0, L: 0.22, H: 0.56 },
  };

  // Função para calcular a pontuação CVSS
  function calculateScore(e: any) {
    e.preventDefault(); // Previne o comportamento padrão do formulário

    // Impact Subscore (ISC)
    const impactSubScore =
      1 -
      (1 - weights.C[confidentialityImpact]) *
        (1 - weights.I[integrityImpact]) *
        (1 - weights.A[availabilityImpact]);

    // Modified Impact Subscore for Scope Changed
    const modifiedImpactSubScore =
      scope === "U"
        ? weights.S.U * impactSubScore
        : weights.S.C * (impactSubScore - 0.029) -
          3.25 * Math.pow(impactSubScore - 0.02, 15);

    // Exploitability Subscore
    const exploitabilityScore =
      8.22 *
      weights.AV[attackVector] *
      weights.AC[attackComplexity] *
      weights.PR[scope][privilegesRequired] *
      weights.UI[userInteraction];

    // Base Score
    const baseScore =
      impactSubScore <= 0
        ? 0
        : scope === "U"
        ? Math.min(modifiedImpactSubScore + exploitabilityScore, 10)
        : Math.min(1.08 * (modifiedImpactSubScore + exploitabilityScore), 10);

    // Round up to one decimal place
    const finalScore = Math.ceil(baseScore * 10) / 10;

    // Chama a função passada pelo componente pai com os dados calculados
    onCalculate({
      attackVector,
      attackComplexity,
      privilegesRequired,
      userInteraction,
      scope,
      confidentialityImpact,
      integrityImpact,
      availabilityImpact,
      score: finalScore,
    });

    // Exibe o resultado no alerta
    console.log(
      `CVSS Score AV:${attackVector}/AC:${attackComplexity}/PR:${privilegesRequired}/UI:${userInteraction}/S:${scope}/C:${confidentialityImpact}/I:${integrityImpact}/A:${availabilityImpact}: ${finalScore}`
    );
  }

  // Função para atualizar os valores dos campos
  function updateField(field: string, value: string) {
    switch (field) {
      case "version":
        version = value as "3.0" | "3.1";
        break;
      case "attackVector":
        attackVector = value as "N" | "A" | "L" | "P";
        break;
      case "attackComplexity":
        attackComplexity = value as "L" | "H";
        break;
      case "privilegesRequired":
        privilegesRequired = value as "N" | "L" | "H";
        break;
      case "userInteraction":
        userInteraction = value as "N" | "R";
        break;
      case "scope":
        scope = value as "U" | "C";
        break;
      case "confidentialityImpact":
        confidentialityImpact = value as "N" | "L" | "H";
        break;
      case "integrityImpact":
        integrityImpact = value as "N" | "L" | "H";
        break;
      case "availabilityImpact":
        availabilityImpact = value as "N" | "L" | "H";
        break;
      default:
        console.error("Campo desconhecido:", field);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Calculadora de CVSS</h1>

      {/* Seleção da Versão */}
      <div className="mb-6">
        <Label>Versão do CVSS</Label>
        <Select onValueChange={(value) => updateField("version", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a versão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3.0">CVSS 3.0</SelectItem>
            <SelectItem value="3.1">CVSS 3.1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Base Metrics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Base Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Attack Vector (AV)</Label>
            <Select onValueChange={(value) => updateField("attackVector", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">Network (N)</SelectItem>
                <SelectItem value="A">Adjacent (A)</SelectItem>
                <SelectItem value="L">Local (L)</SelectItem>
                <SelectItem value="P">Physical (P)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Attack Complexity (AC)</Label>
            <Select onValueChange={(value) => updateField("attackComplexity", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Privileges Required (PR)</Label>
            <Select onValueChange={(value) => updateField("privilegesRequired", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>User Interaction (UI)</Label>
            <Select onValueChange={(value) => updateField("userInteraction", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="R">Required (R)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Label>Scope (S)</Label>
          <Select onValueChange={(value) => updateField("scope", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="U">Unchanged (U)</SelectItem>
              <SelectItem value="C">Changed (C)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Impact Metrics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Confidentiality Impact (C)</Label>
            <Select onValueChange={(value) => updateField("confidentialityImpact", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Integrity Impact (I)</Label>
            <Select onValueChange={(value) => updateField("integrityImpact", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Availability Impact (A)</Label>
            <Select onValueChange={(value) => updateField("availabilityImpact", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">

      {/* Botão de Cálculo */}
      <Button onClick={calculateScore} className="mt-6">
        Salvar
      </Button>
        </div>
      </div>

    </div>
  );
}

export default CVSSCalculator;