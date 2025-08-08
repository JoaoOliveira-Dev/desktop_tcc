import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Code, Copy } from "lucide-react";


export default function SubdomainTakeoverPage() {
  const [takeover, setTakeover] = useState("");

  useEffect(() => {
    fetch("/subdomain-takeover/takeover1.txt")
      .then((res) => res.text())
      .then((text) => setTakeover(text));


}, []);


  return (
    <div className="p-6 space-y-6 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} />
              SUBS_TAKEOVER()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Open SUBS_TAKEOVER()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(takeover);
                    }}
                  >
                    <Copy /> Copy
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {takeover}
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
    