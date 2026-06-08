import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Definir o worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

export type AIProvider = 'claude' | 'openai' | 'openrouter';

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
  nome_empresa: string | null;
  dominio_empresa: string | null;
  data_relatorio: string | null;
  escopo_descricao: string | null;
  resumo_executivo: string | null;
  total_critical: number;
  total_high: number;
  total_medium: number;
  total_low: number;
  total_info: number;
  alvos: Array<{
    url: string | null;
    login: string | null;
    descricao: string | null;
  }>;
  vulnerabilidades: Array<{
    titulo: string;
    categoria: string | null;
    severidade: 'critical' | 'high' | 'medium' | 'low' | 'info';
    cvss_score: string | number | null;
    cvss_vector: string | null;
    descricao: string | null;
    ativo_afetado: string | null;
    impacto: string | null;
    recomendacao: string | null;
    referencias: string[];
    cwe: string[];
    poc_descricao: string | null;
    poc_codigo: string | null;
  }>;
  evidencias?: Array<{
    titulo: string;
    descricao: string;
    src: string;
  }>;
  autor_nome: string | null;
  autor_cargo: string | null;
  autor_telefone: string | null;
  autor_email: string | null;
}

export async function processWithAI(
  sourceText: string,
  apiKey: string,
  provider: AIProvider = 'claude',
  options?: { openRouterModel?: string }
): Promise<ReportData> {
const prompt = `
Você é um especialista em análise técnica de relatórios de pentest e classificação de vulnerabilidades usando padrões internacionais de segurança.

Analise o conteúdo de entrada contendo resultados de segurança ofensiva. A entrada pode combinar texto extraído de PDF, anotações de projeto, escopo, evidências e observações do pentest. Converta tudo para um JSON estruturado.

CONTEÚDO DE ENTRADA:
${sourceText}

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
- Quando houver anotações de projeto, use-as como fonte primária para complementar escopo, ativos, PoCs, impactos e recomendações
`;

  if (provider === 'claude') {
    return await processWithClaude(prompt, apiKey);
  }

  if (provider === 'openrouter') {
    return await processWithOpenRouter(
      prompt,
      apiKey,
      options?.openRouterModel?.trim() || undefined
    );
  }

  return await processWithOpenAI(prompt, apiKey);
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

async function processWithOpenRouter(
  prompt: string,
  apiKey: string,
  model = 'openai/gpt-4o-mini'
): Promise<ReportData> {
  try {
    console.log('📤 Enviando requisição para OpenRouter API...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const appUrl =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': appUrl,
        'X-Title': 'desktop_tcc',
      },
      body: JSON.stringify({
        model,
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
      const error = await response.json().catch(() => ({}));
      console.error('❌ OpenRouter API error response:', error);
      throw new Error(
        `OpenRouter API error: ${error.error?.message || `Status ${response.status}`}`
      );
    }

    const data = await response.json();
    console.log('✓ Resposta recebida do OpenRouter');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Resposta com formato inválido:', data);
      throw new Error('Formato de resposta do OpenRouter inválido');
    }

    const content = data.choices[0].message.content;
    console.log(
      '📄 Conteúdo da resposta (primeiros 500 caracteres):',
      content.substring(0, 500)
    );

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Não encontrou JSON na resposta:', content);
      throw new Error('Não foi possível extrair JSON válido da resposta da IA');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    console.log('✓ JSON extraído e parseado com sucesso');
    return parsedData;
  } catch (error) {
    console.error('❌ Erro em processWithOpenRouter:', error);
    throw error;
  }
}

export function fillReportTemplate(templateHtml: string, data: ReportData): string {
  let html = templateHtml;

  // Substituir seções iteráveis
  html = substituirSecaoIteravel(html, 'alvos', data.alvos);
  html = substituirSecaoIteravel(html, 'vulnerabilidades', data.vulnerabilidades);
  html = substituirSecaoIteravel(html, 'evidencias', data.evidencias ?? []);

  // Substituir campos simples
  html = replaceScalar(html, 'nome_empresa', data.nome_empresa);
  html = replaceScalar(html, 'dominio_empresa', data.dominio_empresa);
  html = replaceScalar(html, 'data_relatorio', data.data_relatorio);
  html = replaceScalar(html, 'escopo_descricao', data.escopo_descricao);
  html = replaceScalar(html, 'resumo_executivo', data.resumo_executivo);
  html = replaceScalar(html, 'total_critical', data.total_critical);
  html = replaceScalar(html, 'total_high', data.total_high);
  html = replaceScalar(html, 'total_medium', data.total_medium);
  html = replaceScalar(html, 'total_low', data.total_low);
  html = replaceScalar(html, 'total_info', data.total_info);
  html = replaceScalar(html, 'autor_nome', data.autor_nome);
  html = replaceScalar(html, 'autor_cargo', data.autor_cargo);
  html = replaceScalar(html, 'autor_telefone', data.autor_telefone);
  html = replaceScalar(html, 'autor_email', data.autor_email);

  return html;
}

function substituirSecaoIteravel(html: string, sectionName: string, items: any[] = []): string {
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
                .map((v: any) =>
                  arrayTemplate.replace(/\{\{\.\}\}/g, formatTemplateValue(v))
                )
                .join('');
            });
          } else {
            itemHtml = itemHtml.replace(
              new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
              formatTemplateValue(value, isRichTextKey(key))
            );
          }
        }
        return itemHtml;
      })
      .join('');
  });
}

function replaceScalar(html: string, key: string, value: unknown) {
  return html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), formatTemplateValue(value));
}

function formatTemplateValue(value: unknown, richText = false) {
  if (value === null || value === undefined) return '';
  if (richText) return formatRichTextValue(String(value));
  return escapeHtml(String(value));
}

function formatRichTextValue(value: string) {
  if (/<\/?[a-z][\s\S]*>/i.test(value)) {
    return value;
  }

  return escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>');
}

function isRichTextKey(key: string) {
  return [
    'descricao',
    'ativo_afetado',
    'impacto',
    'recomendacao',
    'poc_descricao',
    'poc_codigo',
  ].includes(key);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
