import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EncoderDecoder() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [type, setType] = useState<"base64" | "url" | "hex">("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

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

  function handleProcess() {
    let result = "";
    if (mode === "encode") {
      if (type === "base64") result = encodeBase64(input);
      if (type === "url") result = encodeURL(input);
      if (type === "hex") result = encodeHex(input);
    } else {
      if (type === "base64") result = decodeBase64(input);
      if (type === "url") result = decodeURL(input);
      if (type === "hex") result = decodeHex(input);
    }
    setOutput(result);
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Tabs value={mode} onValueChange={v => setMode(v as "encode" | "decode")}>
        <TabsList className="w-full justify-between">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>
      </Tabs>

      <Select value={type} onValueChange={(v) => setType(v as any)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Escolha o tipo de codificação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="base64">Base64</SelectItem>
          <SelectItem value="url">URL</SelectItem>
          <SelectItem value="hex">Hex</SelectItem>
        </SelectContent>
      </Select>

      <Textarea placeholder="Texto de entrada" value={input} onChange={e => setInput(e.target.value)} />
      <Button className="w-full" onClick={handleProcess}>
        {mode === "encode" ? "Codificar" : "Decodificar"}
      </Button>
      <Textarea placeholder="Resultado" value={output} readOnly />
    </div>
  );
}
