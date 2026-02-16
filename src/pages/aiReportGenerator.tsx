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
import { Upload, Loader, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { extractTextFromPDF, processWithAI, fillReportTemplate, ReportData } from '@/lib/pdfProcessor';

type ProcessingStatus = 'idle' | 'uploading' | 'extracting' | 'processing' | 'generating' | 'success' | 'error';

export default function AIReportGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'claude' | 'openai'>('claude');
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

  const handleProcess = async () => {
    if (!file) {
      setErrorMessage('Por favor, selecione um arquivo PDF.');
      return;
    }

    if (!apiKey) {
      setErrorMessage('Por favor, insira sua chave de API.');
      return;
    }

    try {
      setErrorMessage('');
      setStatus('extracting');
      
      console.log('1. Iniciando extração do PDF...');
      const pdfText = await extractTextFromPDF(file);
      console.log('✓ PDF extraído com sucesso, tamanho:', pdfText.length);

      setStatus('processing');
      console.log('2. Enviando para IA...');
      const data = await processWithAI(pdfText, apiKey, provider);
      console.log('✓ IA processou com sucesso:', data);
      setReportData(data);

      setStatus('generating');
      console.log('3. Carregando template...');
      const templateResponse = await fetch('/generate_report/report.html');
      if (!templateResponse.ok) {
        throw new Error(`Erro ao carregar template: ${templateResponse.status} ${templateResponse.statusText}`);
      }
      const reportTemplate = await templateResponse.text();
      console.log('✓ Template carregado, tamanho:', reportTemplate.length);

      console.log('4. Preenchendo relatório...');
      const html = fillReportTemplate(reportTemplate, data);
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

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/html;charset=utf-8,' + encodeURIComponent(generatedHtml)
    );
    element.setAttribute('download', 'relatorio-pentest.html');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPDF = async () => {
    if (!generatedHtml) return;

    try {
      // Usar a biblioteca instalada html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      html2pdf()
        .set({
          margin: 10,
          filename: 'relatorio-pentest.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        })
        .from(generatedHtml)
        .save();
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
          Faça upload de um PDF com os achados do seu pentest e nossa IA irá processar
          e gerar um relatório profissional automaticamente.
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
            <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                <SelectItem value="openai">GPT-4 (OpenAI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  : 'sk-proj-...'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {provider === 'claude'
                ? 'Obtenha sua chave em: https://console.anthropic.com/account/keys'
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
          disabled={!file || !apiKey || status !== 'idle'}
          size="lg"
          className="flex-1"
        >
          {status === 'idle' ? (
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
