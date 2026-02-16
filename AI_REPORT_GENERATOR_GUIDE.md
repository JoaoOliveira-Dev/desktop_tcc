# Gerador de Relatório com IA

## Descrição

A tela **Gerador de Relatório com IA** é uma ferramenta automatizada para transformar seus achados de pentest em um relatório profissional. O sistema utiliza inteligência artificial para:

1. **Leitura de PDF**: Extrai automaticamente o texto de um arquivo PDF contendo seus achados
2. **Processamento com IA**: Analisa o conteúdo utilizando Claude ou OpenAI para estruturar as informações
3. **Preenchimento de Template**: Popula automaticamente um template profissional de relatório
4. **Exportação**: Gera o relatório em HTML ou PDF

## Como Acessar

1. Vá para **Relatório com IA** no menu lateral
2. Ou acesse diretamente: `/ai-report-generator`

## Como Usar

### Passo 1: Prepare seu PDF

Prepare um documento PDF com os achados do seu pentest. O documento deve conter:
- Nome da empresa testada
- Domínio/URLs testadas
- Descrição do escopo
- Lista de vulnerabilidades encontradas com:
  - Título/Nome
  - Categoria (XSS, SQL Injection, CSRF, etc.)
  - Severidade (Critical, High, Medium, Low, Info)
  - CVSS Score e Vector
  - Descrição técnica
  - Ativo/Endpoint afetado
  - Impacto
  - Recomendações
  - Proof of Concept
  - Referências e CWE

### Passo 2: Faça Upload do PDF

1. Clique em **Enviar Arquivo PDF**
2. Selecione seu arquivo PDF com as descobertas

### Passo 3: Configure a IA

1. Escolha o provedor de IA:
   - **Claude (Anthropic)**: Recomendado - Melhor compreensão de contexto
   - **GPT-4 (OpenAI)**: Alternativa poderosa

2. Insira sua chave de API:
   - **Claude**: Obtenha em https://console.anthropic.com/account/keys
   - **OpenAI**: Obtenha em https://platform.openai.com/account/api-keys

### Passo 4: Processar

1. Clique em **Processar Relatório**
2. O sistema irá:
   - Extrair o texto do PDF
   - Processar com a IA escolhida
   - Gerar o relatório

### Passo 5: Baixar Relatório

Após o processamento bem-sucedido, você pode:
- **Baixar HTML**: Download do relatório em HTML pronto para visualizar no navegador
- **Baixar PDF**: Export automático para PDF (requer processamento adicional)
- **Visualizar Prévia**: Veja como ficará o relatório antes de baixar

## Estrutura do Relatório Gerado

O relatório inclui:

```
1. Capa
   - Título
   - Data
   - Empresa
   - Domínio

2. Escopo
   - Descrição da avaliação

3. Alvos Avaliados
   - URLs testadas
   - Credenciais necessárias
   - Descrições

4. Resumo Executivo
   - Sumário das vulnerabilidades
   - Números por severidade

5. Vulnerabilidades Detalhadas
   - Categoria
   - CVSS Score
   - Descrição
   - Ativo afetado
   - Impacto
   - Recomendações
   - Proof of Concept
   - Referências

6. Informações do Responsável
   - Nome
   - Cargo
   - Contato
```

## Dicas Importantes

### ✅ Para Melhores Resultados

- **Seja detalhado**: Quanto mais informações completas no PDF, melhor a IA entenderá
- **Organize bem**: Estruture as vulnerabilidades de forma clara e lógica
- **Inclua contexto**: Adicione explicações sobre o contexto do pentest
- **Forneça PoC**: Sempre inclua proof of concept para vulnerabilidades
- **URLs precisas**: Especifique exatamente qual URL/endpoint foi afetado

### 🔑 Gerenciamento de Chaves de API

- **Não compartilhe sua chave**: Nunca compartilhe sua chave de API
- **Armazene com segurança**: Use gerenciadores de senhas
- **Revogue se necessário**: Você pode revogar chaves na plataforma de cada provedor
- **Limpe o campo**: A chave não é armazenada, limpe-a manualmente após usar

### 💰 Custos

- **Claude**: Cobrado por tokens de entrada/saída
- **OpenAI**: Cobrado pelo modelo GPT-4 (mais caro que GPT-3.5)

## Troubleshooting

### "Erro ao processar o arquivo"
- Verifique se o arquivo é um PDF válido
- Tente um PDF menor para testar

### "Chave de API inválida"
- Copie a chave corretamente do painel do provedor
- Verifique se a chave está ativa/não expirou
- Certifique-se de estar usando a chave correta (Claude ≠ OpenAI)

### "Timeout ao processar"
- O PDF pode ser muito grande ou a IA está demorando
- Tente dividir em PDFs menores
- Verifique sua conexão de internet

### "JSON inválido da IA"
- A IA não conseguiu estruturar os dados corretamente
- Reformule o PDF com informações mais claras
- Tente com o outro provedor de IA

## Template de Relatório

O template utilizado está em: `/public/generate_report/report.html`

Este arquivo contém:
- Estilos CSS profissionais
- Placeholders para preenchimento automático
- Formatação responsiva
- Suporte a impressão

## Desenvolvimento

### Arquivos Relacionados

- `src/pages/aiReportGenerator.tsx` - Página principal da IA
- `src/lib/pdfProcessor.ts` - Lógica de processamento de PDF e IA
- `public/generate_report/report.html` - Template de relatório
- `src/main.tsx` - Rota `/ai-report-generator`

### Funções Principais

```typescript
// Extrai texto do PDF
extractTextFromPDF(file: File): Promise<string>

// Processa com IA (Claude ou OpenAI)
processWithAI(
  pdfText: string, 
  apiKey: string, 
  provider: 'claude' | 'openai'
): Promise<ReportData>

// Preenchimento do template
fillReportTemplate(
  templateHtml: string, 
  data: ReportData
): string
```

## Próximas Melhorias Sugeridas

- [ ] Adicionar suporte a mais provedores de IA (Gemini, Claude 3 Opus)
- [ ] Salvar projetos/histórico de relatórios
- [ ] Editar dados extraídos antes de gerar o relatório
- [ ] Customizar template de relatório
- [ ] Exportar em outros formatos (Word, Markdown, JSON)
- [ ] Interface de integração com APIs locais
- [ ] Cache de resultados da IA
