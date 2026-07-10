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
    subcategoria?: string | null;
    owasp?: string | null;
    cwe?: string | null;
    severidade: 'critical' | 'high' | 'medium' | 'low' | 'info';
    cvss_score: string | number | null;
    cvss_vector: string | null;
    descricao: string | null;
    ativo_afetado: string | null;
    impacto: string | null;
    recomendacao: string | null;
    referencias: string[];
    poc_descricao: string | null;
    poc_legenda?: string | null;
    poc_codigo: string | null;
    retest_status?: string | null;
    retest_descricao?: string | null;
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
- Escreva em terceira pessoa, com tom formal e objetivo
- O título de cada vulnerabilidade deve ser específico, indicando o ponto afetado quando essa informação existir

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PADRÃO DE ESCRITA DO RELATÓRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para cada vulnerabilidade:

- "titulo": descreva a falha de forma acionável. Evite apenas o nome genérico da vulnerabilidade.
- "categoria": use a família da falha, alinhada ao OWASP Top 10 quando possível.
- "subcategoria": especifique o tipo, por exemplo Stored, Reflected, IDOR, SPF permissivo ou TLS fraco.
- "owasp": informe o item do OWASP Top 10 quando aplicável.
- "cwe": informe a CWE quando aplicável.
- "descricao": explique primeiro a vulnerabilidade de forma geral e depois como ela aparece no ambiente analisado.
- "impacto": divida o texto em "Impacto Técnico" e "Impacto de Negócio".
- "recomendacao": descreva medidas claras de mitigação, preferencialmente úteis para desenvolvimento/operação.
- "poc_descricao": registre a prova de conceito de forma objetiva, com passos e evidências observadas.
- "poc_legenda": use uma legenda curta no formato "Figura: ...", se houver evidência.
- "retest_status": use Corrigido, Corrigido parcialmente, Não corrigido, Não validado ou Não aplicável.
- "retest_descricao": descreva o resultado do re-test quando essa informação existir.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFERÊNCIAS TÉCNICAS (OBRIGATÓRIO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para cada vulnerabilidade, forneça referências que ajudem o cliente a:

- entender a falha
- entender impacto
- corrigir corretamente

Prioridade de fontes:

1. OWASP
2. PortSwigger Web Security Academy
3. NIST / NVD
4. Documentação oficial do fabricante
5. RFC técnicas

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
      "subcategoria": string | null,
      "owasp": string | null,
      "cwe": string | null,
      "severidade": "critical" | "high" | "medium" | "low" | "info",
      "cvss_score": number | null,
      "cvss_vector": string | null,
      "descricao": string | null,
      "ativo_afetado": string | null,
      "impacto": string | null,
      "recomendacao": string | null,
      "referencias": string[],
      "poc_descricao": string | null,
      "poc_legenda": string | null,
      "poc_codigo": string | null,
      "retest_status": string | null,
      "retest_descricao": string | null
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

  return removeUnresolvedTemplateTags(html);
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
        return removeUnresolvedTemplateTags(itemHtml);
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
    return applyMarkdownBold(value);
  }

  return applyMarkdownBold(escapeHtml(value)).replace(/\r\n|\r|\n/g, '<br>');
}

function applyMarkdownBold(value: string) {
  return value
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
}

function isRichTextKey(key: string) {
  return [
    'descricao',
    'ativo_afetado',
    'impacto',
    'recomendacao',
    'poc_descricao',
    'poc_codigo',
    'retest_descricao',
  ].includes(key);
}

function removeUnresolvedTemplateTags(html: string) {
  return html
    .replace(/\{\{#[^}]+\}\}[\s\S]*?\{\{\/[^}]+\}\}/g, '')
    .replace(/\{\{\/?[^}]+\}\}/g, '');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
