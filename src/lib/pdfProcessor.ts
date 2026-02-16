import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Definir o worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

export interface ReportData {
  nome_empresa: string;
  dominio_empresa: string;
  data_relatorio: string;
  escopo_descricao: string;
  resumo_executivo: string;
  total_critical: number;
  total_high: number;
  total_medium: number;
  total_low: number;
  total_info: number;
  alvos: Array<{
    url: string;
    login: string;
    descricao: string;
  }>;
  vulnerabilidades: Array<{
    titulo: string;
    categoria: string;
    severidade: 'critical' | 'high' | 'medium' | 'low' | 'info';
    cvss_score: string;
    cvss_vector: string;
    descricao: string;
    ativo_afetado: string;
    impacto: string;
    recomendacao: string;
    referencias: string[];
    cwe: string[];
    poc_descricao: string;
    poc_codigo: string;
  }>;
  autor_nome: string;
  autor_cargo: string;
  autor_telefone: string;
  autor_email: string;
}

export async function processWithAI(
  pdfText: string,
  apiKey: string,
  provider: 'claude' | 'openai' = 'claude'
): Promise<ReportData> {
const prompt = `
Você é um especialista em análise técnica de relatórios de pentest e classificação de vulnerabilidades usando padrões internacionais de segurança.

Analise o texto extraído de um PDF contendo resultados de segurança ofensiva e converta para um JSON estruturado.

TEXTO DO PDF:
${pdfText}

RETORNE EXATAMENTE UM OBJETO JSON VÁLIDO seguindo este schema.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRAS OBRIGATÓRIAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Resposta deve conter APENAS JSON puro
- Não escreva explicações
- Não escreva texto antes ou depois do JSON
- Use UTF-8 válido
- Escape corretamente quebras de linha e aspas
- Todos campos devem existir
- Se dado não existir, use null
- Números devem ser números, não strings
- Datas no formato YYYY-MM-DD
- Idioma do output: Português
- Severidade deve ser normalizada para:
  critical | high | medium | low | info
- Remova duplicações de vulnerabilidades
- Se houver múltiplos alvos, liste todos
- Referências devem ser URLs completas quando possível
- Preserve fidelidade técnica do conteúdo original

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLASSIFICAÇÃO CWE (OBRIGATÓRIO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para cada vulnerabilidade:

1. Identifique a causa raiz técnica
2. Associe ao CWE MAIS ESPECÍFICO possível
3. Use formato oficial: CWE-79, CWE-89 etc.
4. Evite CWEs genéricos se houver específico
5. Pode haver múltiplos CWEs
6. Se não for possível determinar com confiança → array vazio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFERÊNCIAS TÉCNICAS (OBRIGATÓRIO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para cada vulnerabilidade, forneça referências que ajudem o cliente a:

- entender a falha
- entender impacto
- corrigir corretamente

Prioridade de fontes:

1. OWASP
2. MITRE CWE
3. PortSwigger Web Security Academy
4. NIST / NVD
5. Documentação oficial do fabricante
6. RFC técnicas

Regras:

- mínimo 2 referências quando possível
- URLs completas
- diretamente relacionadas à vulnerabilidade
- evitar blogs genéricos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CVSS v3.1 — CÁLCULO OBRIGATÓRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para cada vulnerabilidade:

Se o CVSS já estiver no texto → use exatamente o valor informado.

Se NÃO estiver:

Calcule um CVSS Base Score estimado baseado no impacto técnico descrito.

Determine também o CVSS Vector completo no padrão:

CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H

Use julgamento técnico profissional baseado em:

- Attack Vector (AV)
- Attack Complexity (AC)
- Privileges Required (PR)
- User Interaction (UI)
- Scope (S)
- Confidentiality Impact (C)
- Integrity Impact (I)
- Availability Impact (A)

Regras importantes:

- Score deve ser número decimal (ex: 9.8)
- Vector deve ser compatível com o score
- Não inventar impacto não descrito
- Se não houver dados suficientes → null

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFERÊNCIA PERMITIDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Permitido inferir apenas:

- Severidade quando não informada
- CWE compatível com a falha
- CVSS estimado
- Referências técnicas adequadas

Proibido inventar:

- ativos não mencionados
- impacto não descrito
- exploração não demonstrada
- dados organizacionais
- PoC inexistente

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "nome_empresa": string | null,
  "dominio_empresa": string | null,
  "data_relatorio": string | null,
  "escopo_descricao": string | null,
  "resumo_executivo": string | null,

  "total_critical": number,
  "total_high": number,
  "total_medium": number,
  "total_low": number,
  "total_info": number,

  "alvos": [
    {
      "url": string | null,
      "login": string | null,
      "descricao": string | null
    }
  ],

  "vulnerabilidades": [
    {
      "titulo": string,
      "categoria": string | null,
      "severidade": "critical" | "high" | "medium" | "low" | "info",
      "cvss_score": number | null,
      "cvss_vector": string | null,
      "descricao": string | null,
      "ativo_afetado": string | null,
      "impacto": string | null,
      "recomendacao": string | null,
      "referencias": string[],
      "cwe": string[],
      "poc_descricao": string | null,
      "poc_codigo": string | null
    }
  ],

  "autor_nome": string | null,
  "autor_cargo": string | null,
  "autor_telefone": string | null,
  "autor_email": string | null
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Não invente informações que não existem no texto
- Inferência mínima permitida
- Preserve precisão técnica absoluta
`;

  if (provider === 'claude') {
    return await processWithClaude(prompt, apiKey);
  } else {
    return await processWithOpenAI(prompt, apiKey);
  }
}

async function processWithClaude(prompt: string, apiKey: string): Promise<ReportData> {
  try {
    console.log('📤 Enviando requisição para Claude API...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Claude API error response:', error);
      throw new Error(`Claude API error: ${error.error?.message || `Status ${response.status}`}`);
    }

    const data = await response.json();
    console.log('✓ Resposta recebida da Claude');
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('❌ Resposta com formato inválido:', data);
      throw new Error('Formato de resposta da Claude inválido');
    }
    
    const content = data.content[0].text;
    console.log('📄 Conteúdo da resposta (primeiros 500 caracteres):', content.substring(0, 500));
    
    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Não encontrou JSON na resposta:', content);
      throw new Error('Não foi possível extrair JSON válido da resposta da IA');
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    console.log('✓ JSON extraído e parseado com sucesso');
    return parsedData;
  } catch (error) {
    console.error('❌ Erro em processWithClaude:', error);
    throw error;
  }
}

async function processWithOpenAI(prompt: string, apiKey: string): Promise<ReportData> {
  try {
    console.log('📤 Enviando requisição para OpenAI API...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI API error response:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || `Status ${response.status}`}`);
    }

    const data = await response.json();
    console.log('✓ Resposta recebida da OpenAI');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Resposta com formato inválido:', data);
      throw new Error('Formato de resposta da OpenAI inválido');
    }
    
    const content = data.choices[0].message.content;
    console.log('📄 Conteúdo da resposta (primeiros 500 caracteres):', content.substring(0, 500));
    
    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Não encontrou JSON na resposta:', content);
      throw new Error('Não foi possível extrair JSON válido da resposta da IA');
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    console.log('✓ JSON extraído e parseado com sucesso');
    return parsedData;
  } catch (error) {
    console.error('❌ Erro em processWithOpenAI:', error);
    throw error;
  }
}

export function fillReportTemplate(templateHtml: string, data: ReportData): string {
  let html = templateHtml;

  // Substituir campos simples
  html = html.replace(/\{\{nome_empresa\}\}/g, data.nome_empresa);
  html = html.replace(/\{\{dominio_empresa\}\}/g, data.dominio_empresa);
  html = html.replace(/\{\{data_relatorio\}\}/g, data.data_relatorio);
  html = html.replace(/\{\{escopo_descricao\}\}/g, data.escopo_descricao);
  html = html.replace(/\{\{resumo_executivo\}\}/g, data.resumo_executivo);
  html = html.replace(/\{\{total_critical\}\}/g, data.total_critical.toString());
  html = html.replace(/\{\{total_high\}\}/g, data.total_high.toString());
  html = html.replace(/\{\{total_medium\}\}/g, data.total_medium.toString());
  html = html.replace(/\{\{total_low\}\}/g, data.total_low.toString());
  html = html.replace(/\{\{total_info\}\}/g, data.total_info.toString());
  html = html.replace(/\{\{autor_nome\}\}/g, data.autor_nome);
  html = html.replace(/\{\{autor_cargo\}\}/g, data.autor_cargo);
  html = html.replace(/\{\{autor_telefone\}\}/g, data.autor_telefone);
  html = html.replace(/\{\{autor_email\}\}/g, data.autor_email);

  // Substituir seções iteráveis
  html = substituirSecaoIteravel(html, 'alvos', data.alvos);
  html = substituirSecaoIteravel(html, 'vulnerabilidades', data.vulnerabilidades);

  return html;
}

function substituirSecaoIteravel(html: string, sectionName: string, items: any[]): string {
  const regex = new RegExp(`\\{\\{#${sectionName}\\}\\}([\\s\\S]*?)\\{\\{\\/${sectionName}\\}\\}`, 'g');
  
  return html.replace(regex, (_match: string, template: string) => {
    return items
      .map((item) => {
        let itemHtml = template;
        for (const [key, value] of Object.entries(item)) {
          if (Array.isArray(value)) {
            // Para arrays dentro de items
            const arrayRegex = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{\\/${key}\\}\\}`, 'g');
            itemHtml = itemHtml.replace(arrayRegex, (_arrayMatch: string, arrayTemplate: string) => {
              return value
                .map((v: any) => arrayTemplate.replace(/\{\{\\.\}\}/g, v))
                .join('');
            });
          } else {
            itemHtml = itemHtml.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
          }
        }
        return itemHtml;
      })
      .join('');
  });
}
