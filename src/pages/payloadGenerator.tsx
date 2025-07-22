import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { payloads } from "@/lib/payloads";
import { rsgData } from "@/lib/rsgData";

export default function PayloadGenerator() {
  const [ip, setIp] = useState("10.10.10.10");
  const [port, setPort] = useState("9001");
  const [shell, setShell] = useState("sh");
  const [selectedPayloadIndex, setSelectedPayloadIndex] = useState(0);
  const [listenerIndex, setListenerIndex] = useState(0);
  const [advanced, setAdvanced] = useState(false);

  const selectedPayload = payloads[selectedPayloadIndex];
  const [listenerName, listenerTemplate] = rsgData.listenerCommands[listenerIndex];

  const formatCommand = (template: string) =>
    template
      .replace(/{ip}/g, ip)
      .replace(/{port}/g, port)
      .replace(/{shell}/g, shell);

  const listenerCommand = listenerTemplate.replace(/{port}/g, port);

  return (
    <div className="p-6 space-y-6 text-white min-h-screen">
      {/* IP & Port */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="#1c1c1c]">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold">IP & Port</h2>
              <div className="flex-1">
                <Label>IP</Label>
                <Input value={ip} onChange={(e) => setIp(e.target.value)} />
              </div>
              <div className="flex-1">
                <Label>Port</Label>
                <Input value={port} onChange={(e) => setPort(e.target.value)} />
              </div>
            </CardContent>
        </Card>

        {/* Listener */}
        <Card className=" #1c1c1c]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Listener</h2>
              <div className="flex items-center gap-2">
                <Label>Advanced</Label>
                <Switch checked={advanced} onCheckedChange={setAdvanced} />
              </div>
            </div>

            <div className="mt-2">
              <Label>Type</Label>
              <Select value={listenerIndex.toString()} onValueChange={(val) => setListenerIndex(Number(val))}>
                <SelectTrigger className="w-full  #2a2a2a] text-white">
                  <SelectValue placeholder="Select listener" />
                </SelectTrigger>
                <SelectContent className=" #2a2a2a]">
                  {rsgData.listenerCommands.map(([name], idx) => (
                    <SelectItem key={name} value={idx.toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className=" #2a2a2a] p-2 rounded mt-4 font-mono text-sm">
              {listenerCommand}
            </div>
            <Button className="mt-2" onClick={() => navigator.clipboard.writeText(listenerCommand)}>
              Copy
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for payloads */}
      <Tabs defaultValue="reverse">
        <TabsList className=" #1c1c1c]">
          <TabsTrigger value="reverse">Reverse</TabsTrigger>
          <TabsTrigger value="bind">Bind</TabsTrigger>
          <TabsTrigger value="msfvenom">MSFVenom</TabsTrigger>
          <TabsTrigger value="hoaxshell">HoaxShell</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex gap-4">
          {/* Payload Sidebar */}
          <div className="w-1/4 space-y-2  #1c1c1c] p-2 rounded overflow-y-auto max-h-[60vh]">
            {payloads.map((p, i) => (
              <Button
                key={p.name}
                variant={i === selectedPayloadIndex ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedPayloadIndex(i)}
              >
                {p.name}
              </Button>
            ))}
          </div>

          {/* Payload Output */}
          <div className="w-3/4 space-y-4">
          <Label>Resultado</Label>
            <Card className=" #1c1c1c]">
              <CardContent className="p-4 font-mono text-sm whitespace-pre-wrap">
                {formatCommand(selectedPayload.command)}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Shell</Label>
                <Select value={shell} onValueChange={(val) => setShell(val)}>
                  <SelectTrigger className="w-full  #2a2a2a] text-white">
                    <SelectValue placeholder="Select shell" />
                  </SelectTrigger>
                  <SelectContent className=" #2a2a2a]">
                    {rsgData.shells.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label>Encoding</Label>
                <Input disabled value="None" />
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
