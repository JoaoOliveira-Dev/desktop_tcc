import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { AlertCircle, CheckCircle } from "lucide-react"; // Ícones do Lucide

// Tipagem para os estados da aplicação
interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export default function ApiTester() {
  const [url, setUrl] = useState<string>("");
  const [method, setMethod] = useState<string>("GET");
  const [rawHeaders, setRawHeaders] = useState<string>(""); // Cabeçalhos no formato "chave: valor"
  const [rawBody, setRawBody] = useState<string>(""); // Corpo no formato "chave: valor" ou JSON
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Função para converter cabeçalhos no formato "chave: valor" para objeto
  const parseHeaders = (rawHeaders: string): Record<string, string> => {
    const headers: Record<string, string> = {};
    rawHeaders.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      if (key && value) headers[key.trim()] = value;
    });
    return headers;
  };

  // Função para converter corpo no formato "chave: valor" para JSON
  const parseBody = (rawBody: string): any => {
    try {
      return JSON.parse(rawBody); // Tenta parsear como JSON
    } catch {
      const body: Record<string, string> = {};
      rawBody.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        const value = valueParts.join(":").trim();
        if (key && value) body[key.trim()] = value;
      });
      return body; // Retorna como objeto se não for JSON
    }
  };

  // Função para formatar cabeçalhos ou corpo no formato "chave: valor"
  const formatAsKeyValue = (data: Record<string, string>): string => {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };

  // Função para formatar o corpo da resposta
  const formatResponseBody = (body: string): string => {
    try {
      const parsedBody = JSON.parse(body); // Tenta parsear como JSON
      return JSON.stringify(parsedBody, null, 2); // Formata como JSON legível
    } catch {
      return body; // Retorna como texto puro se não for JSON
    }
  };

  // Função para verificar se o corpo é HTML
  const isHtml = (content: string): boolean => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    return Array.from(doc.body.childNodes).some(
      (node) => node.nodeType === Node.ELEMENT_NODE
    );
  };

  const handleFetch = async () => {
    if (!url) {
      setError("Por favor, insira uma URL válida.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      // Parse dos cabeçalhos e do corpo
      const parsedHeaders = parseHeaders(rawHeaders);
      const parsedBody = method !== "GET" ? parseBody(rawBody) : undefined;

      // Configuração da solicitação
      const requestOptions: RequestInit = {
        method: method,
        headers: {
          // Inclui Content-Type apenas para métodos com corpo
          ...(["POST", "PUT"].includes(method) && {
            "Content-Type": "application/json",
          }),
          ...parsedHeaders,
        },
        body: ["POST", "PUT"].includes(method)
          ? JSON.stringify(parsedBody)
          : undefined,
      };

      // Fazendo a solicitação com um proxy alternativo
      const proxyUrl = "https://api.allorigins.win/raw?url=";
      const fullUrl = url.startsWith("http") ? url : `http://${url}`;

      const res = await fetch(
        proxyUrl + encodeURIComponent(fullUrl),
        requestOptions
      );

      // Extraindo informações da resposta
      const responseBody = await res.text(); // Captura o corpo da resposta como texto
      const responseHeaders = Object.fromEntries(res.headers.entries()); // Captura todos os cabeçalhos
      const responseStatus = res.status; // Captura o código de status HTTP

      // Montando a resposta completa
      const fullResponse: ApiResponse = {
        status: responseStatus,
        headers: responseHeaders,
        body: responseBody,
      };

      setResponse(fullResponse); // Atualiza o estado com a resposta completa
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Ocorreu um erro ao buscar os dados.");
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen mt-5 mb-5">
      <Card className="w-full max-w-7xl">
        <CardHeader>
          <CardTitle>API Tester</CardTitle>
          <CardDescription>
            Teste APIs como no Burp Suite. Configure URL, método, cabeçalhos e
            corpo da requisição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Campo de entrada para a URL e método HTTP */}
            <div className="flex items-center space-x-4">
              <Select
                value={method}
                onValueChange={(value) => setMethod(value)}
              >
                <SelectTrigger
                  className={`w-[120px] ${
                    method === "GET"
                      ? "text-green-600"
                      : method === "POST"
                      ? "text-orange-500"
                      : method === "PUT"
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Insira a URL da API"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="flex-grow"
              />
              <Button onClick={handleFetch} disabled={loading}>
                {loading ? "Carregando..." : "Enviar"}
              </Button>
            </div>
            {/* Cabeçalhos da Requisição */}
            <Textarea
              placeholder="Cabeçalhos (chave: valor)\nAuthorization: Bearer token\nContent-Type: application/json"
              value={rawHeaders}
              onChange={(e) => setRawHeaders(e.target.value)}
              rows={6}
            />
            {/* Corpo da Requisição */}
            {["POST", "PUT"].includes(method) && (
              <Textarea
                placeholder="Corpo da requisição (chave: valor ou JSON)\n{\n  key: value\n}"
                value={rawBody}
                onChange={(e) => setRawBody(e.target.value)}
                rows={8}
              />
            )}
            {/* Área de exibição da resposta */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-900 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {response && (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center space-x-2">
                  {response.status >= 200 && response.status < 300 ? (
                    <CheckCircle className="text-green-500" />
                  ) : (
                    <AlertCircle className="text-red-500" />
                  )}
                  <p className="font-semibold">
                    Status: {response.status}{" "}
                    {response.status >= 200 && response.status < 300
                      ? "(Sucesso)"
                      : "(Erro)"}
                  </p>
                </div>
                {/* Cabeçalhos da Resposta */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="headers">
                    <AccordionTrigger>Cabeçalhos</AccordionTrigger>
                    <AccordionContent>
                      <pre className="whitespace-pre-wrap break-all p-4 border rounded bg-white dark:bg-gray-800">
                        {formatAsKeyValue(response.headers)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {/* Corpo da Resposta */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="body">
                    <AccordionTrigger>Corpo</AccordionTrigger>
                    <AccordionContent>
                      {isHtml(response.body) ? (
                        <pre className="whitespace-pre-wrap break-all p-4 border rounded bg-white dark:bg-gray-800">
                          {response.body}
                        </pre>
                      ) : (
                        <pre className="whitespace-pre-wrap break-all p-4 border rounded bg-white dark:bg-gray-800">
                          {formatResponseBody(response.body)}
                        </pre>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>{/* Botão de envio */}</CardFooter>
      </Card>
    </div>
  );
}
