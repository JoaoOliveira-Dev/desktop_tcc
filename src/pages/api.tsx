import { useEffect, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { AlertCircle, CheckCircle, X } from "lucide-react"; // Ícones do Lucide
import { useParams } from "react-router";

// Tipagem para os estados da aplicação
interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

interface ApiTab {
  id: number;
  project_id: number | null;
  name: string;
  method: string;
  url: string;
  headers: string;
  body: string;
}

export default function ApiTester() {
  const { projectId } = useParams();
  const [tabs, setTabs] = useState<ApiTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  const [url, setUrl] = useState<string>("");
  const [method, setMethod] = useState<string>("GET");
  const [rawHeaders, setRawHeaders] = useState<string>(""); // Cabeçalhos no formato "chave: valor"
  const [rawBody, setRawBody] = useState<string>(""); // Corpo no formato "chave: valor" ou JSON
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTabs = async () => {
      const result = await window.electron.getApiTabs(
        projectId ? Number(projectId) : null
      );
      setTabs(result);
      if (result.length > 0) setActiveTab(String(result[0].id));
    };
    fetchTabs();
  }, [projectId]);

  async function createNewTab() {
    setResponse(null);

    const newTab = await window.electron.createApiTab({
      project_id: projectId ? Number(projectId) : null,
      name: "Nova Aba",
      method: "GET",
      url: "",
      headers: "",
      body: "",
    });
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(String(newTab.id));
  }

  async function renameTab(id: number, newName: string) {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    const updated = await window.electron.updateApiTab({
      ...tab,
      name: newName,
    });
    setTabs((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function deleteTab(id: number) {
    await window.electron.deleteApiTab(id);
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (String(id) === activeTab && tabs.length > 0) {
      setActiveTab(String(tabs[0].id));
    }
  }

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

  const handleFetch = async (tab: ApiTab) => {
    if (!tab.url) {
      setError("Por favor, insira uma URL válida.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      // Parse dos cabeçalhos e do corpo
      const parsedHeaders = parseHeaders(tab.headers || "");
      const parsedBody =
        tab.method !== "GET" ? parseBody(tab.body || "") : undefined;

      // Configuração da solicitação
      const requestOptions: RequestInit = {
        method: tab.method,
        headers: {
          // Inclui Content-Type apenas para métodos com corpo
          ...(["POST", "PUT"].includes(tab.method) && {
            "Content-Type": "application/json",
          }),
          ...parsedHeaders,
        },
        body: ["POST", "PUT"].includes(tab.method)
          ? JSON.stringify(parsedBody)
          : undefined,
      };

      // Fazendo a solicitação com proxy
      const proxyUrl = "https://api.allorigins.win/raw?url=";
      const fullUrl = tab.url.startsWith("http")
        ? tab.url
        : `http://${tab.url}`;

      const res = await fetch(
        proxyUrl + encodeURIComponent(fullUrl),
        requestOptions
      );

      // Extraindo informações da resposta
      const responseBody = await res.text();
      const responseHeaders = Object.fromEntries(res.headers.entries());
      const responseStatus = res.status;

      const fullResponse: ApiResponse = {
        status: responseStatus,
        headers: responseHeaders,
        body: responseBody,
      };

      setResponse(fullResponse);
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
    <div className="flex justify-center items-center mt-5 mb-5">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-full mb-3">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={String(tab.id)}
              onClick={() => setResponse(null)}
            >
              <input
                className="bg-transparent border-none focus:ring-0 focus:outline-none w-20"
                value={tab.name}
                onChange={(e) => renameTab(tab.id, e.target.value)}
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteTab(tab.id)}
              >
                <X />
              </Button>
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="w-screen max-w-7xl">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              API Tester <Button onClick={createNewTab}>+ Nova Aba</Button>
            </CardTitle>
            <CardDescription>
              Teste APIs como no Burp Suite. Configure URL, método, cabeçalhos e
              corpo da requisição.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={String(tab.id)}>
                {/* FORMULÁRIO DA ABA */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Select
                      value={tab.method}
                      onValueChange={async (value) => {
                        const updated = await window.electron.updateApiTab({
                          ...tab,
                          method: value,
                        });
                        setTabs((prev) =>
                          prev.map((t) => (t.id === tab.id ? updated : t))
                        );
                      }}
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
                      value={tab.url}
                      disabled={loading}
                      onChange={async (e) => {
                        const updated = await window.electron.updateApiTab({
                          ...tab,
                          url: e.target.value,
                        });
                        setTabs((prev) =>
                          prev.map((t) => (t.id === tab.id ? updated : t))
                        );
                      }}
                    />

                    <Button onClick={() => handleFetch(tab)} disabled={loading}>
                      {" "}
                      {loading ? "Carregando..." : "Enviar"}
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Cabeçalhos (chave: valor) \n Authorization: Bearer token \n Content-Type: application/json"
                    value={tab.headers}
                    onChange={async (e) => {
                      const updated = await window.electron.updateApiTab({
                        ...tab,
                        headers: e.target.value,
                      });
                      setTabs((prev) =>
                        prev.map((t) => (t.id === tab.id ? updated : t))
                      );
                    }}
                  />

                  {["POST", "PUT"].includes(tab.method) && (
                    <Textarea
                      placeholder="Corpo da requisição"
                      value={tab.body}
                      onChange={async (e) => {
                        const updated = await window.electron.updateApiTab({
                          ...tab,
                          body: e.target.value,
                        });
                        setTabs((prev) =>
                          prev.map((t) => (t.id === tab.id ? updated : t))
                        );
                      }}
                    />
                  )}
                </div>

                {/* RESPOSTA */}
                {response && (
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center space-x-2 mt-5">
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
              </TabsContent>
            ))}
          </CardContent>
          <CardFooter>{/* Botão de envio */}</CardFooter>
        </Card>
      </Tabs>
    </div>
  );
}
