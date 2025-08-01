import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Code, Copy } from "lucide-react";


export default function ClickJackingPage() {
  const [jacking1, setJacking1] = useState("");
  const [jacking2, setJacking2] = useState("");
  const [jacking3, setJacking3] = useState("");

  useEffect(() => {
    fetch("/clickjacking/click_jacking1.txt")
      .then((res) => res.text())
      .then((text) => setJacking1(text));

    fetch("/clickjacking/click_jacking2.txt")
      .then((res) => res.text())
      .then((text) => setJacking2(text));

    fetch("/clickjacking/click_jacking3.txt")
      .then((res) => res.text())
      .then((text) => setJacking3(text));
}, []);


  return (
    <div className="p-6 space-y-6 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} />
              Click_Jacking_1()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Open Click_Jacking_1()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(jacking1);
                    }}
                  >
                    <Copy /> Copy
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {jacking1}
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
              Click_Jacking_2()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Open Click_Jacking_1()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(jacking2);
                    }}
                  >
                    <Copy /> Copy
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {jacking2}
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
              Click_Jacking_3()
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Open Click_Jacking_3()</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full text-white">
                <div className="flex justify-start mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(jacking3);
                    }}
                  >
                    <Copy /> Copy
                  </Button>
                </div>
                <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
                  <code className="text-sm">
                    {jacking3}
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
    