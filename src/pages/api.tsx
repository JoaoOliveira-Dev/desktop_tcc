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
import { Label } from "@/components/ui/label"; // NOVO: Import para Label
import { Switch } from "@/components/ui/switch"; // NOVO: Import do Switch
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useParams } from "react-router";

// Tipagem para os estados da aplicação
interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

// MODIFICADO: Adicionado campo 'response' à tipagem da aba
interface ApiTab {
  id: number;
  project_id: number | null;
  name: string;
  method: string;
  url: string;
  headers: string;
  body: string;
  response: string | null; // Armazenará a resposta como JSON stringificado
  h_response: string | null;
  status: number | null;
}

export default function ApiTester() {
  const { projectId } = useParams();
  const [tabs, setTabs] = useState<ApiTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  // NOVO: Estado para controlar o modo de salvamento
  const [saveMode, setSaveMode] = useState<"auto" | "manual">("auto");

  // MODIFICADO: Removido o estado 'response' separado. Ele agora faz parte de cada 'tab'.
  // const [response, setResponse] = useState<ApiResponse | null>(null);
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

  // Função centralizada para atualizar uma aba no estado local e, opcionalmente, no banco
  const handleTabChange = async (
    tabId: number,
    updatedFields: Partial<ApiTab>
  ) => {
    let updatedTab: ApiTab | undefined;

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === tabId) {
          updatedTab = { ...t, ...updatedFields };
          return updatedTab;
        }
        return t;
      })
    );

    if (saveMode === "auto" && updatedTab) {
      if (updatedTab.name.trim() === "") {
        setError("O nome da aba não pode estar vazio.");
        return;
      }

      await window.electron.updateApiTab(updatedTab);
    }
  };

  // NOVO: Função para salvar manualmente a aba ativa
  const handleSaveTab = async () => {
    const currentTab = tabs.find((t) => String(t.id) === activeTab);

    if (currentTab && currentTab !== undefined) {
      await window.electron.updateApiTab(currentTab);
      // Opcional: Adicionar um feedback visual de que foi salvo.
    }
  };

  async function createNewTab() {
    const newTab = await window.electron.createApiTab({
      project_id: projectId ? Number(projectId) : null,
      name: "Nova Aba",
      method: "GET",
      url: "",
      headers: "",
      body: "",
      response: null,
      h_response: null,
      status: null,
    });
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(String(newTab.id));
  }

  async function renameTab(id: number, newName: string) {
    handleTabChange(id, { name: newName });
  }

  async function deleteTab(id: number) {
    await window.electron.deleteApiTab(id);
    const remainingTabs = tabs.filter((t) => t.id !== id);
    setTabs(remainingTabs);

    if (String(id) === activeTab && remainingTabs.length > 0) {
      setActiveTab(String(remainingTabs[0].id));
    } else if (remainingTabs.length === 0) {
      setActiveTab("");
    }
  }

  const parseHeaders = (rawHeaders: string): Record<string, string> => {
    const headers: Record<string, string> = {};
    rawHeaders.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      if (key && value) headers[key.trim()] = value;
    });
    return headers;
  };

  const parseBody = (rawBody: string): any => {
    try {
      return JSON.parse(rawBody);
    } catch {
      const body: Record<string, string> = {};
      rawBody.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        const value = valueParts.join(":").trim();
        if (key && value) body[key.trim()] = value;
      });
      return body;
    }
  };

  const formatAsKeyValue = (data: Record<string, string>): string => {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };

  const formatResponseBody = (body: string): string => {
    try {
      const parsedBody = JSON.parse(body);
      return JSON.stringify(parsedBody, null, 2);
    } catch {
      return body;
    }
  };

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
    // Limpa a resposta antiga da aba atual no estado local antes de uma nova requisição
    handleTabChange(tab.id, { response: null });

    try {
      const parsedHeaders = parseHeaders(tab.headers || "");
      const parsedBody =
        tab.method !== "GET" ? parseBody(tab.body || "") : undefined;

      const requestOptions: RequestInit = {
        method: tab.method,
        headers: {
          ...(["POST", "PUT"].includes(tab.method) && {
            "Content-Type": "application/json",
          }),
          ...parsedHeaders,
        },
        body: ["POST", "PUT"].includes(tab.method)
          ? JSON.stringify(parsedBody)
          : undefined,
      };

      const proxyUrl = "https://api.allorigins.win/raw?url=";
      const fullUrl = tab.url.startsWith("http")
        ? tab.url
        : `http://${tab.url}`;

      const res = await fetch(
        proxyUrl + encodeURIComponent(fullUrl),
        requestOptions
      );

      const responseBody = await res.text();
      const responseHeaders = Object.fromEntries(res.headers.entries());
      const responseStatus = res.status;

      const fullResponse: ApiResponse = {
        status: responseStatus,
        headers: responseHeaders,
        body: responseBody,
      };

      // MODIFICADO: Salva a resposta na aba correspondente
      handleTabChange(tab.id, { response: JSON.stringify(fullResponse) });
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

  // NOVO: Encontra os dados da aba ativa e parseia sua resposta para renderização
  const activeTabData = tabs.find((t) => String(t.id) === activeTab);
  const activeTabResponse: ApiResponse | null = activeTabData?.response
    ? JSON.parse(activeTabData.response)
    : null;

  return (
    <div className="flex justify-center items-center mt-5 mb-5">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center">
          <TabsList className="h-full mb-3">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={String(tab.id)}
                // MODIFICADO: Removido o onClick que limpava a resposta
              >
                <input
                  className="bg-transparent border-none focus:ring-0 focus:outline-none w-24 pr-2"
                  value={tab.name}
                  onChange={(e) => renameTab(tab.id, e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation(); // Impede que o clique ative a aba
                    deleteTab(tab.id);
                  }}
                  className="rounded-full h-6 w-6 p-0"
                >
                  <X size={16} />
                </Button>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex justify-center">
          <Card className="w-screen max-w-7xl">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                API Tester <Button onClick={createNewTab}>+ Nova Aba</Button>
              </CardTitle>
              <CardDescription className="flex justify-between items-center pt-2">
                <span>
                  Teste APIs como no Burp Suite. Configure URL, método,
                  cabeçalhos e corpo da requisição.
                </span>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="save-mode"
                    checked={saveMode === "auto"}
                    onCheckedChange={(checked) =>
                      setSaveMode(checked ? "auto" : "manual")
                    }
                  />
                  <Label htmlFor="save-mode">Salvar Automaticamente</Label>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tabs
                .filter((tab) => String(tab.id) === activeTab) // Renderiza apenas a aba ativa
                .map((tab) => (
                  <TabsContent key={tab.id} value={String(tab.id)}>
                    {/* FORMULÁRIO DA ABA */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Select
                          value={tab.method}
                          onValueChange={(value) =>
                            handleTabChange(tab.id, { method: value })
                          }
                        >
                          <SelectTrigger
                            className={`w-[120px] ${
                              tab.method === "GET"
                                ? "text-green-600"
                                : tab.method === "POST"
                                ? "text-orange-500"
                                : tab.method === "PUT"
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
                          onChange={(e) =>
                            handleTabChange(tab.id, { url: e.target.value })
                          }
                        />

                        {/* NOVO: Botão de Salvar Manual */}
                        {saveMode === "manual" && (
                          <Button onClick={handleSaveTab}>Salvar</Button>
                        )}

                        <Button
                          onClick={() => handleFetch(tab)}
                          disabled={loading}
                        >
                          {loading ? "Carregando..." : "Enviar"}
                        </Button>
                      </div>

                      <Textarea
                        placeholder="Cabeçalhos (chave: valor) \n Authorization: Bearer token \n Content-Type: application/json"
                        value={tab.headers}
                        onChange={(e) =>
                          handleTabChange(tab.id, { headers: e.target.value })
                        }
                      />

                      {["POST", "PUT"].includes(tab.method) && (
                        <Textarea
                          placeholder="Corpo da requisição"
                          value={tab.body}
                          onChange={(e) =>
                            handleTabChange(tab.id, { body: e.target.value })
                          }
                        />
                      )}
                    </div>

                    {/* RESPOSTA - MODIFICADO para usar 'activeTabResponse' */}
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    {activeTabResponse && (
                      <div className="space-y-4">
                        {/* Status */}
                        <div className="flex items-center space-x-2 mt-5">
                          {activeTabResponse.status >= 200 &&
                          activeTabResponse.status < 300 ? (
                            <CheckCircle className="text-green-500" />
                          ) : (
                            <AlertCircle className="text-red-500" />
                          )}
                          <p className="font-semibold">
                            Status: {activeTabResponse.status}{" "}
                            {activeTabResponse.status >= 200 &&
                            activeTabResponse.status < 300
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
                                {formatAsKeyValue(activeTabResponse.headers)}
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        {/* Corpo da Resposta */}
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="body">
                            <AccordionTrigger>Corpo</AccordionTrigger>
                            <AccordionContent>
                              {isHtml(activeTabResponse.body) ? (
                                <pre className="whitespace-pre-wrap break-all p-4 border rounded bg-white dark:bg-gray-800">
                                  {activeTabResponse.body}
                                </pre>
                              ) : (
                                <pre className="whitespace-pre-wrap break-all p-4 border rounded bg-white dark:bg-gray-800">
                                  {formatResponseBody(activeTabResponse.body)}
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
            <CardFooter>{/* Pode ser usado para algo no futuro */}</CardFooter>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
