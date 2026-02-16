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
Você é um especialista em análise de relatórios de pentest. Leia o seguinte texto de um arquivo PDF contendo achados de pentest e extraia as informações em um formato JSON estruturado.

TEXTO DO PDF:
${pdfText}

Extraia as seguintes informações e retorne um JSON com exatamente esta estrutura (certifique-se de que é JSON válido):

{
  "nome_empresa": "nome da empresa testada",
  "dominio_empresa": "domínio principal da empresa",
  "data_relatorio": "data do relatório (YYYY-MM-DD)",
  "escopo_descricao": "descrição do escopo do pentest",
  "resumo_executivo": "resumo executivo das vulnerabilidades encontradas",
  "total_critical": número de vulnerabilidades críticas,
  "total_high": número de vulnerabilidades altas,
  "total_medium": número de vulnerabilidades médias,
  "total_low": número de vulnerabilidades baixas,
  "total_info": número de achados informativos,
  "alvos": [
    {
      "url": "URL do alvo",
      "login": "instruções de login ou identificação",
      "descricao": "descrição do alvo"
    }
  ],
  "vulnerabilidades": [
    {
      "titulo": "título da vulnerabilidade",
      "categoria": "categoria (ex: XSS, SQL Injection, CSRF)",
      "severidade": "critical|high|medium|low|info",
      "cvss_score": "9.8",
      "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      "descricao": "descrição técnica da vulnerabilidade",
      "ativo_afetado": "qual ativo/endpoint foi afetado",
      "impacto": "impacto da vulnerabilidade",
      "recomendacao": "recomendação de remediação",
      "referencias": ["referência 1", "referência 2"],
      "cwe": ["CWE-79", "CWE-89"],
      "poc_descricao": "descrição do proof of concept",
      "poc_codigo": "código ou payload do PoC"
    }
  ],
  "autor_nome": "nome do pentester",
  "autor_cargo": "cargo/título do pentester",
  "autor_telefone": "telefone de contato",
  "autor_email": "email de contato"
}

Importante:
- Se alguma informação não estiver disponível no PDF, use um valor padrão apropriado
- Mantenha a estrutura JSON válida
- Retorne APENAS o JSON, sem explicações adicionais
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
