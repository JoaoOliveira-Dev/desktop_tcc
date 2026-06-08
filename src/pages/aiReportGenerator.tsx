import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader, Download, AlertCircle, CheckCircle, FolderOpen } from 'lucide-react';
import {
  extractTextFromPDF,
  processWithAI,
  fillReportTemplate,
  ReportData,
  type AIProvider,
} from '@/lib/pdfProcessor';
import {
  getReportTemplate,
  reportTemplates,
  type ReportTemplateId,
} from '@/lib/reportTemplates';
import { downloadHtmlFile, downloadPdfFromHtml } from '@/lib/htmlReport';

type ProcessingStatus = 'idle' | 'uploading' | 'extracting' | 'processing' | 'generating' | 'success' | 'error';

type Project = {
  id: number;
  name: string;
};

export default function AIReportGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIProvider>('claude');
  const [openRouterModel, setOpenRouterModel] = useState('openai/gpt-4o-mini');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('none');
  const [projectNotes, setProjectNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<ReportTemplateId>('rafa');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'success' && downloadSectionRef.current) {
      console.log('📍 Scroll para seção de download');
      downloadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (status === 'success' && generatedHtml && downloadSectionRef.current) {
      console.log('✓ Seção de download disponível:', downloadSectionRef.current);
    }
  }, [status, generatedHtml]);

  useEffect(() => {
    window.electron?.getProjects?.().then((result) => {
      setProjects(result || []);
    });
  }, []);

  useEffect(() => {
    if (selectedProjectId === 'none') {
      setProjectNotes([]);
      return;
    }

    let isCurrent = true;
    setIsLoadingNotes(true);

    window.electron
      .getNotes(Number(selectedProjectId))
      .then((result) => {
        if (isCurrent) {
          setProjectNotes(result || []);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar notas do projeto:', error);
        if (isCurrent) {
          setProjectNotes([]);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingNotes(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedProjectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setErrorMessage('');
    } else {
      setErrorMessage('Por favor, selecione um arquivo PDF válido.');
      setFile(null);
    }
  };

  const getSelectedProject = () =>
    projects.find((project) => String(project.id) === selectedProjectId);

  const readNoteContent = (note: Note) => {
    const container = document.createElement('div');
    container.innerHTML = note.content || '';

    const images = Array.from(container.querySelectorAll('img'));
    images.forEach((image) => image.remove());

    return {
      text: (container.innerText || container.textContent || '')
        .replace(/\s+/g, ' ')
        .trim(),
      imageSources: images
        .map((image) => image.getAttribute('src') || '')
        .filter(Boolean),
    };
  };

  const buildProjectNotesContext = (project: Project, notes: Note[]) => {
    if (notes.length === 0) {
      return `PROJETO SELECIONADO: ${project.name}\nSem notas cadastradas.`;
    }

    const serializedNotes = notes
      .map((note, index) => {
        const { text, imageSources } = readNoteContent(note);

        return [
          `NOTA ${index + 1}`,
          `Pasta: ${note.folder}`,
          `Título: ${note.title}`,
          `Conteúdo: ${text || '[sem texto]'}`,
          `Prints coladas: ${imageSources.length}`,
        ].join('\n');
      })
      .join('\n\n');

    return `PROJETO SELECIONADO: ${project.name}\n\nANOTAÇÕES DO PROJETO:\n${serializedNotes}`;
  };

  const extractNoteEvidences = (notes: Note[]) => {
    return notes.flatMap((note) => {
      const { imageSources } = readNoteContent(note);

      return imageSources.map((src, index) => ({
        titulo: `${note.title} - Print ${index + 1}`,
        descricao: `Evidência importada da pasta ${note.folder}`,
        src,
      }));
    });
  };

  const handleProcess = async () => {
    const selectedProject = getSelectedProject();

    if (!file && !selectedProject) {
      setErrorMessage('Selecione um arquivo PDF ou um projeto com anotações.');
      return;
    }

    if (!apiKey) {
      setErrorMessage('Por favor, insira sua chave de API.');
      return;
    }

    try {
      setErrorMessage('');
      const sourceParts: string[] = [];
      let notesForReport = projectNotes;
      
      if (file) {
        setStatus('extracting');
        console.log('1. Iniciando extração do PDF...');
        const pdfText = await extractTextFromPDF(file);
        sourceParts.push(`TEXTO EXTRAÍDO DO PDF:\n${pdfText}`);
        console.log('✓ PDF extraído com sucesso, tamanho:', pdfText.length);
      }

      if (selectedProject) {
        notesForReport = await window.electron.getNotes(selectedProject.id);

        if (!file && notesForReport.length === 0) {
          setStatus('idle');
          setErrorMessage('O projeto selecionado ainda não possui anotações.');
          return;
        }

        setProjectNotes(notesForReport);
        sourceParts.push(buildProjectNotesContext(selectedProject, notesForReport));
      }

      const sourceText = sourceParts.join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n').trim();

      if (!sourceText) {
        setStatus('idle');
        setErrorMessage('Não há conteúdo suficiente para enviar para a IA.');
        return;
      }

      setStatus('processing');
      console.log('2. Enviando para IA...');
      const data = await processWithAI(sourceText, apiKey, provider, {
        openRouterModel,
      });
      const dataWithEvidence: ReportData = {
        ...data,
        evidencias: [
          ...(data.evidencias ?? []),
          ...extractNoteEvidences(notesForReport),
        ],
      };
      console.log('✓ IA processou com sucesso:', data);
      setReportData(dataWithEvidence);

      setStatus('generating');
      console.log('3. Carregando template...');
      const selectedTemplate = getReportTemplate(selectedTemplateId);
      const templateResponse = await fetch(selectedTemplate.path);
      if (!templateResponse.ok) {
        throw new Error(`Erro ao carregar template: ${templateResponse.status} ${templateResponse.statusText}`);
      }
      const reportTemplate = await templateResponse.text();
      console.log('✓ Template carregado, tamanho:', reportTemplate.length);

      console.log('4. Preenchendo relatório...');
      const html = fillReportTemplate(reportTemplate, dataWithEvidence);
      console.log('✓ Relatório preenchido, tamanho:', html.length);
      setGeneratedHtml(html);
      console.log('📝 HTML setado no estado, aguarde a renderização...');

      setStatus('success');
      console.log('✓ Processo concluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? `Erro: ${error.message}`
          : 'Erro ao processar o arquivo. Tente novamente.'
      );
    }
  };

  const handleDownloadReport = () => {
    if (!generatedHtml) return;
    downloadHtmlFile(generatedHtml, 'relatorio-pentest.html');
  };

  const handleDownloadPDF = async () => {
    if (!generatedHtml) return;

    try {
      await downloadPdfFromHtml(generatedHtml, 'relatorio-pentest.pdf');
    } catch (error) {
      setErrorMessage('Erro ao gerar PDF. Tente baixar o HTML.');
      console.error('PDF generation error:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 w-full text-white max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Gerador de Relatório com IA</h1>
        <p className="text-muted-foreground">
          Use um PDF, as anotações de um projeto ou os dois como fonte para a IA
          gerar o relatório automaticamente.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            Enviar Arquivo PDF
          </CardTitle>
          <CardDescription>Selecione o PDF com os achados do pentest</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pdf-upload" className="block mb-2">
              Arquivo PDF
            </Label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <p className="text-gray-400">
                  {file ? `✓ ${file.name}` : 'Clique para selecionar ou arraste um PDF aqui'}
                </p>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project and Template Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen size={20} />
            Projeto e Template
          </CardTitle>
          <CardDescription>
            Selecione um projeto para a IA usar suas anotações e escolha o layout do relatório.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="project" className="block mb-2">
              Projeto com anotações
            </Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não usar projeto</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedProjectId === 'none'
                ? 'A IA usará apenas o PDF enviado.'
                : isLoadingNotes
                ? 'Carregando anotações...'
                : `${projectNotes.length} nota(s) carregada(s) para contexto.`}
            </p>
          </div>

          <div>
            <Label htmlFor="template" className="block mb-2">
              Template do relatório
            </Label>
            <Select
              value={selectedTemplateId}
              onValueChange={(value) =>
                setSelectedTemplateId(value as ReportTemplateId)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {reportTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {getReportTemplate(selectedTemplateId).description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da IA</CardTitle>
          <CardDescription>Configure qual provedor de IA usar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="provider" className="block mb-2">
              Provedor de IA
            </Label>
            <Select
              value={provider}
              onValueChange={(value) => setProvider(value as AIProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                <SelectItem value="openai">GPT-4 (OpenAI)</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {provider === 'openrouter' && (
            <div>
              <Label htmlFor="openrouter-model" className="block mb-2">
                Modelo OpenRouter
              </Label>
              <Input
                id="openrouter-model"
                placeholder="Ex: openai/gpt-4o-mini"
                value={openRouterModel}
                onChange={(e) => setOpenRouterModel(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          )}

          <div>
            <Label htmlFor="api-key" className="block mb-2">
              Chave de API
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder={
                provider === 'claude'
                  ? 'sk-ant-...'
                  : provider === 'openrouter'
                  ? 'sk-or-v1-...'
                  : 'sk-proj-...'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {provider === 'claude'
                ? 'Obtenha sua chave em: https://console.anthropic.com/account/keys'
                : provider === 'openrouter'
                ? 'Obtenha sua chave em: https://openrouter.ai/keys'
                : 'Obtenha sua chave em: https://platform.openai.com/account/api-keys'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-500">Erro</p>
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {status !== 'idle' && status !== 'success' && status !== 'error' && (
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Loader size={20} className="text-blue-500 animate-spin" />
          <div>
            <p className="font-semibold text-blue-500">
              {status === 'extracting' && 'Extraindo texto do PDF...'}
              {status === 'processing' && 'Processando com IA...'}
              {status === 'generating' && 'Gerando relatório...'}
              {status === 'uploading' && 'Enviando arquivo...'}
            </p>
            <p className="text-sm text-blue-400">Isto pode levar alguns momentos</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-500">Relatório gerado com sucesso!</p>
            <p className="text-sm text-green-400">
              O relatório está pronto para download
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleProcess}
          disabled={
            (!file && selectedProjectId === 'none') ||
            !apiKey ||
            (status !== 'idle' && status !== 'error') ||
            isLoadingNotes
          }
          size="lg"
          className="flex-1"
        >
          {status === 'idle' || status === 'error' ? (
            <>
              <Upload size={18} className="mr-2" />
              Processar Relatório
            </>
          ) : (
            <>
              <Loader size={18} className="mr-2 animate-spin" />
              Processando...
            </>
          )}
        </Button>
      </div>

      {/* Download Buttons */}
      {status === 'success' && generatedHtml && (
        <div ref={downloadSectionRef} className="scroll-mt-20">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Relatório Gerado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportData && (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Empresa:</span>{' '}
                    <span className="font-semibold">{reportData.nome_empresa}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Domínio:</span>{' '}
                    <span className="font-semibold">{reportData.dominio_empresa}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Total de Vulnerabilidades:</span>{' '}
                    <span className="font-semibold">
                      {reportData.total_critical +
                        reportData.total_high +
                        reportData.total_medium +
                        reportData.total_low +
                        reportData.total_info}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Template:</span>{' '}
                    <span className="font-semibold">
                      {getReportTemplate(selectedTemplateId).name}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Evidências das notas:</span>{' '}
                    <span className="font-semibold">
                      {reportData.evidencias?.length ?? 0}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadReport}
                  variant="secondary"
                  className="flex-1"
                >
                  <Download size={18} className="mr-2" />
                  Baixar HTML
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  variant="secondary"
                  className="flex-1"
                >
                  <Download size={18} className="mr-2" />
                  Baixar PDF
                </Button>
              </div>

              <Button
                onClick={() => {
                  setGeneratedHtml('');
                  setReportData(null);
                  setFile(null);
                  setStatus('idle');
                }}
                variant="ghost"
                className="w-full"
              >
                Processar Novo Arquivo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Section */}
      {generatedHtml && (
        <Card>
          <CardHeader>
            <CardTitle>Prévia do Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 p-4 rounded-lg overflow-auto max-h-96 border border-slate-700">
              <iframe
                srcDoc={generatedHtml}
                className="w-full h-96 border-0 bg-white"
                title="Prévia do Relatório"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
