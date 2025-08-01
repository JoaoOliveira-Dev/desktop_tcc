import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Code, Copy } from "lucide-react";


export default function CSRFPage() {
  const [csrfForms, setCsrfForms] = useState("");
  const [csrfScript, setCsrfScript] = useState("");
  const [csrfIframe, setCsrfIframe] = useState("");

  useEffect(() => {
    fetch("/csrf/csrf_forms.txt")
      .then((res) => res.text())
      .then((text) => setCsrfForms(text));

    fetch("/csrf/csrf_script.txt")
      .then((res) => res.text())
      .then((text) => setCsrfScript(text));

    fetch("/csrf/csrf_iframe.txt")
      .then((res) => res.text())
      .then((text) => setCsrfIframe(text));
}, []);


  return (
    <div className="p-6 space-y-6 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} />
              CSRF_FORMS()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Open CSRF_FORMS()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(csrfForms);
                    }}
                  >
                    <Copy /> Copy
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {csrfForms}
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
              CSRF_SCRIPT()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Open CSRF_SCRIPT()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(csrfScript);
                    }}
                  >
                    <Copy /> Copy
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {csrfScript}
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
              CSRF_Iframe()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Open CSRF_Iframe()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(csrfIframe);
                    }}
                  >
                    <Copy /> Copy
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {csrfIframe}
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
    