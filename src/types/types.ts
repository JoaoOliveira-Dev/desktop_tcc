export interface Alvo {
    id: string;
    link: string;
  }
  
  export interface VulnType {
    id: string;
    nome: string;
    descVuln: string;
    ativos: string;
    referencia: string;
    impacto: string;
    reparo: string;
    poc: string;
    severidade: string;
    cvssData?: {
      attackVector: string;
      attackComplexity: string;
      privilegesRequired: string;
      userInteraction: string;
      scope: string;
      confidentialityImpact: string;
      integrityImpact: string;
      availabilityImpact: string;
      score: number;
    };
  }
  
  export interface CVSSCalculatorProps {
    onCalculate: (data: {
      attackVector: string;
      attackComplexity: string;
      privilegesRequired: string;
      userInteraction: string;
      scope: string;
      confidentialityImpact: string;
      integrityImpact: string;
      availabilityImpact: string;
      score: number;
    }) => void;
  }