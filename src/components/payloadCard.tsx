import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Code, Copy } from "lucide-react";

interface PayloadCardProps {
  title: string;
  payload: string;
  buttonLabel?: string;
}

export function PayloadCard({ title, payload, buttonLabel = "Abrir" }: PayloadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code size={20} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">{buttonLabel} {title}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full text-white">
            <div className="flex justify-start mb-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(payload);
                }}
              >
                <Copy /> Copiar
              </Button>
            </div>
            <pre className="bg-zinc-900 rounded p-4 overflow-x-auto max-h-96 overflow-y-auto mt-0">
              <code className="text-sm">
                {payload}
              </code>
            </pre>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}