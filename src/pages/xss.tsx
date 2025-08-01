import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Code, Copy } from "lucide-react";

export default function XSSPage() {
  const [xssAlert, setXssAlert] = useState("");
  const [customAlert, setCustomAlert] = useState("");
  const [xssSwfFuzz, setXssSwfFuzz] = useState("");

  useEffect(() => {
    fetch("/xss/xss_alert.txt")
      .then((res) => res.text())
      .then((text) => setXssAlert(text));

    fetch("/xss/custom_xss.txt")
      .then((res) => res.text())
      .then((text) => setCustomAlert(text));

    fetch("/xss/xss_swf_fuzz.txt")
      .then((res) => res.text())
      .then((text) => setXssSwfFuzz(text));
  }, []);

  return (
    <div className="p-6 space-y-6 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} />
              CUSTOM_XSS()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Abrir CUSTOM_XSS()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(customAlert);
                    }}
                  >
                    <Copy /> Copiar
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {customAlert}
                  </code>
                </pre>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} />
              XSS_ALERT()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Abrir XSS_ALERT()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(xssAlert);
                    }}
                  >
                    <Copy /> Copiar
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {xssAlert}
                  </code>
                </pre>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} />
              XSS_SWF_FUZZ()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Abrir XSS_SWF_FUZZ()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(xssSwfFuzz);
                    }}
                  >
                    <Copy /> Copiar
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {xssSwfFuzz}
                  </code>
                </pre>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}