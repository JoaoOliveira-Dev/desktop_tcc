import { use, useEffect, useState } from "react";
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

export default function PentestNotes() {
  const { projectId } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folder, setFolder] = useState("Recon");

  const [debouncedTitle, setDebouncedTitle] = useState(title);
  const [debouncedContent, setDebouncedContent] = useState(content);

  const [folders, setFolders] = useState<string[]>([
    "Recon",
    "Exploitation",
    "Post-Exploitation",
    "Vulnerability Analysis",
  ]);

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitle(title);
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [title]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedContent(content);
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [content]);

  // Carregar notas
  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!debouncedTitle && !debouncedContent && !folder) {
      return;
    }

    handleSaveNote();
  }, [debouncedTitle, debouncedContent, folder, selectedNote]);

  async function fetchNotes() {
    const result = await window.electron.getNotes(
      projectId ? Number(projectId) : null
    );

    console.log("Fetched notes:", result);
  }

  async function handleSaveNote() {
    if (selectedNote && selectedNote.id) {
      const updated = {
        ...selectedNote,
        title: debouncedTitle,
        content: debouncedContent,
        folder,
      };
      await window.electron.updateNote(updated);
      // Atualiza a lista de notas com a versão mais recente
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === updated.id ? updated : n))
      );
    } else {
      const newNote = await window.electron.createNote({
        project_id: Number(projectId),
        title: debouncedTitle || "Nova Nota",
        content: debouncedContent,
        folder,
      });

      if (newNote) {
        setSelectedNote(newNote);

        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
    }
  }

  function handleSelectNote(note: Note) {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setFolder(note.folder);
  }

  function newNoteForm() {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setFolder("Recon");
  }

  async function handleDeleteNote(id: number) {
    await window.electron.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNote?.id === id) newNoteForm();
  }

  function createFolder() {
    const name = newFolderName.trim();
    if (!name) return alert("Nome da pasta não pode ser vazio.");
    if (folders.includes(name)) return alert("Já existe essa pasta.");
    setFolders((prev) => [...prev, name]);
    setNewFolderName("");
    setIsNewFolderOpen(false);
  }

  return (
    <div className="flex h-screen text-white">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-800 p-2 flex flex-col">
        <div className="flex gap-2 mb-2">
          <Button onClick={newNoteForm} className="w-full">
            + Nova Nota
          </Button>
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
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsNewFolderOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={createFolder}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="flex-1 pr-2">
          <Accordion type="multiple" className="w-full">
            {folders.map((f) => (
              <AccordionItem key={f} value={f}>
                <AccordionTrigger>{f}</AccordionTrigger>
                <AccordionContent>
                  {notes
                    .filter((n) => n.folder === f)
                    .map((note) => (
                      <div
                        key={note.id}
                        className="flex justify-between items-center p-2 rounded"
                      >
                        <div
                          onClick={() => handleSelectNote(note)}
                          className="cursor-pointer flex-1"
                        >
                          <p className="font-semibold">{note.title}</p>
                          <p className="text-xs text-gray-400">
                            {note.content.slice(0, 50)}...
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
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 space-y-4">
        <Input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger>
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
          className="w-full h-[65vh] bg-[#0f1720] p-3 rounded text-sm text-white"
          placeholder="Conteúdo da nota"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button onClick={handleSaveNote} className="w-full">
          {selectedNote ? "Atualizar Nota" : "Criar Nota"}
        </Button>
      </div>
    </div>
  );
}
