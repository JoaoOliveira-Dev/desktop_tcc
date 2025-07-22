import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export default function EncoderDecoder() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [steps, setSteps] = useState([{ type: "base64" as "base64" | "url" | "hex" }]);
  const [input, setInput] = useState("");

  function encodeBase64(text: string) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function decodeBase64(text: string) {
    try {
      return decodeURIComponent(escape(atob(text)));
    } catch {
      return "Erro ao decodificar Base64";
    }
  }

  function encodeURL(text: string) {
    return encodeURIComponent(text);
  }

  function decodeURL(text: string) {
    try {
      return decodeURIComponent(text);
    } catch {
      return "Erro ao decodificar URL";
    }
  }

  function encodeHex(text: string) {
    return Array.from(text).map(c => c.charCodeAt(0).toString(16)).join("");
  }

  function decodeHex(text: string) {
    try {
      return text.match(/.{1,2}/g)?.map(h => String.fromCharCode(parseInt(h, 16))).join("") || "";
    } catch {
      return "Erro ao decodificar Hex";
    }
  }

  function process(text: string, type: string) {
    if (mode === "encode") {
      if (type === "base64") return encodeBase64(text);
      if (type === "url") return encodeURL(text);
      if (type === "hex") return encodeHex(text);
    } else {
      if (type === "base64") return decodeBase64(text);
      if (type === "url") return decodeURL(text);
      if (type === "hex") return decodeHex(text);
    }
    return text;
  }

  const results = steps.reduce((acc, step, index) => {
    const result = process(acc[index], step.type);
    acc.push(result);
    return acc;
  }, [input]);

  return (
    <div className="w-4/6 mx-auto p-4 space-y-4 text-white">
      <Tabs value={mode} onValueChange={v => setMode(v as "encode" | "decode")}>
        <TabsList className="w-full">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>
      </Tabs>

      <Textarea placeholder="Texto de entrada" value={input} onChange={e => setInput(e.target.value)} />

      {steps.map((step, i) => (
        <div key={i} className="space-y-2">
          <Select value={step.type} onValueChange={v => {
            const newSteps = [...steps];
            newSteps[i].type = v as any;
            setSteps(newSteps);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha o tipo de codificação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base64">Base64</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="hex">Hex</SelectItem>
            </SelectContent>
          </Select>
          <Textarea readOnly value={results[i + 1]} placeholder="Resultado desta etapa" />
          {steps.length > 1 && (
            <Button
            variant="destructive"
            onClick={() => setSteps(steps.filter((_, index) => index !== i))}
            >
              Remover etapa
            </Button>
          )
          }
        </div>
      ))}

      <Button
        className="w-full flex items-center gap-2"
        variant="secondary"
        onClick={() => setSteps([...steps, { type: "base64" }])}
      >
        <Plus className="w-4 h-4" /> Adicionar etapa
      </Button>
    </div>
  );
}
