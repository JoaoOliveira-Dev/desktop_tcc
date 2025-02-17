"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { isValidUrl } from "../utils/helpers";
import { Alvo } from "../types/types";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaRegTrashAlt } from "react-icons/fa";

interface ScopeProps {
  alvos: Alvo[];
  setAlvos: React.Dispatch<React.SetStateAction<Alvo[]>>;
}

export default function Scope({ alvos, setAlvos }: ScopeProps) {
  const [novoAlvo, setNovoAlvo] = useState<string>("");

  const adicionarAlvo = () => {
    if (novoAlvo.trim() !== "" && isValidUrl(novoAlvo)) {
      setAlvos([...alvos, { id: uuidv4(), link: novoAlvo }]);
      setNovoAlvo("");
    } else {
      alert("Por favor, insira uma URL válida.");
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Escopo do Pentest</CardTitle>
        <CardDescription>
          Adicione os links dos alvos que serão testados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="link">Link do Alvo</Label>
            <Input
              id="link"
              placeholder="Insira o link do alvo"
              value={novoAlvo}
              onChange={(e) => setNovoAlvo(e.target.value)}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setNovoAlvo("")}>
          Limpar
        </Button>
        <Button onClick={adicionarAlvo}>Adicionar</Button>
      </CardFooter>

      {/* Tabela de alvos */}
      <Table className="mt-6">
        <TableCaption>Lista de alvos adicionados.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-center">#</TableHead>
            <TableHead>Link do Alvo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alvos.length > 0 ? (
            alvos.map((alvo, index) => (
              <TableRow key={alvo.id}>
                <TableCell className="text-center font-medium">
                  {String(index + 1).padStart(2, "0")}
                </TableCell>
                <TableCell>{alvo.link}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setAlvos(alvos.filter((item) => item.id !== alvo.id))
                    }
                  >
                    <FaRegTrashAlt />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                Nenhum alvo adicionado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
