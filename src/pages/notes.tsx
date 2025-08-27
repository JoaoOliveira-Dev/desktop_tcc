import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Trash2, FolderPlus } from "lucide-react";
import { defaultNotes } from "../utils/defaultnote";
import type { Note } from "../utils/defaultnote";

export default function PentestNotes() {
  const { projectId } = useParams(); // vem da URL
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [standanteNote, setStandanteNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folder, setFolder] = useState("Recon");

  const [folders, setFolders] = useState<string[]>([
    "Recon",
    "Exploitation",
    "Post-Exploitation",
    "Vulnerability Analysis",
  ]);
  const [selectedFolder, setSelectedFolder] = useState("Recon");

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      const result = await window.electron.getNotes(
        projectId ? Number(projectId) : null
      );
      setNotes(result);
    };

    fetchNotes();
  }, [projectId]);

  function handleAddNote() {
    if (selectedNote) {
      // Editando nota existente
      setNotes(
        notes.map((n) =>
          n.id === selectedNote.id
            ? { ...n, title: title || "Nova Nota", content, folder }
            : n
        )
      );
    } else {
      // Criando nova nota
      const newNote: Note = {
        id: Date.now(),
        folder,
        title: title || "Nova Nota",
        content,
      };
      setNotes([...notes, newNote]);
    }
  }
  function handleSelectNote(note: Note) {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setFolder(note.folder);
  }

  function newNote() {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setFolder("Recon");
  }

  function handleDeleteNote(id: number) {
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setTitle("");
      setContent("");
    }
  }

  // Criar nova pasta via Dialog (substitui prompt)
  function createFolder() {
    const name = newFolderName?.trim();
    if (!name) return alert("Nome da pasta não pode ser vazio.");
    if (folders.includes(name))
      return alert("Já existe uma pasta com este nome.");
    setFolders((prev) => [...prev, name]);
    setSelectedFolder(name);
    setNewFolderName("");
    setIsNewFolderOpen(false);
  }

  return (
    <div className="flex h-screen text-white">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-800 p-2 flex flex-col">
        <div className="flex gap-2 mb-2">
          <Button onClick={newNote} className="w-full">
            + Nova Nota
          </Button>

          {/* Botão para abrir Dialog de criação de pasta */}
          <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm text-white">
              <DialogHeader>
                <DialogTitle>Nova pasta</DialogTitle>
              </DialogHeader>

              <div className="space-y-2">
                <Input
                  placeholder="Nome da pasta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>

              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setNewFolderName("");
                    setIsNewFolderOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={createFolder}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Lista de pastas: cada pasta abre um dialog com as notas */}
        <ScrollArea className="flex-1 pr-2">
          <Accordion type="multiple" className="w-full">
            {folders.map((f) => (
              <AccordionItem key={f} value={f}>
                <div className="flex items-center justify-between w-full">
                  <AccordionTrigger className="flex-1 text-left">
                    {f}
                  </AccordionTrigger>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (
                        confirm(
                          `Tem certeza que deseja excluir a pasta "${f}"? Isso removerá todas as notas dentro dela.`
                        )
                      ) {
                        setFolders((prev) =>
                          prev.filter((folder) => folder !== f)
                        );
                        setNotes((prev) =>
                          prev.filter((note) => note.folder !== f)
                        );
                      }
                    }}
                  >
                    Excluir
                  </Button>
                </div>

                <AccordionContent>
                  <div className="space-y-2">
                    {notes.filter((n) => n.folder === f).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma nota nesta pasta.
                      </p>
                    )}

                    {notes
                      .filter((n) => n.folder === f)
                      .map((note) => (
                        <div
                          key={note.id}
                          className="flex justify-between items-center p-2 rounded"
                        >
                          <div
                            className="pr-4 cursor-pointer"
                            onClick={() => handleSelectNote(note)}
                          >
                            <p className="font-semibold">{note.title}</p>
                            <p className="text-xs text-gray-400">
                              {note.content.slice(0, 80)}
                              {note.content.length > 80 ? "..." : ""}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>{" "}
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 space-y-4">
        <Input
          placeholder="Título da nota"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Select value={folder} onValueChange={(v) => setFolder(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Escolha a pasta" />
          </SelectTrigger>
          <SelectContent>
            {folders.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <textarea
          placeholder="Conteúdo da nota"
          className="w-full h-[65vh] bg-[#0f1720] p-3 rounded text-sm text-white"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Button onClick={handleAddNote} className="w-full">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
