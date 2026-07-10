export interface Alvo {
    id: string;
    link: string;
  }
  
  export interface VulnType {
    id: string;
    nome: string;
    titulo?: string;
    categoria?: string;
    subcategoria?: string;
    owasp?: string;
    cwe?: string;
    descVuln: string;
    ativos: string;
    referencia: string;
    impacto: string;
    reparo: string;
    poc: string;
    pocLegenda?: string;
    retestStatus?: string;
    retestDescricao?: string;
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
    initialValue?: VulnType["cvssData"];
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
