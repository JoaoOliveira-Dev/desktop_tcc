import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
} from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const defaultFolders = [
  "Recon",
  "Exploitation",
  "Post-Exploitation",
  "Vulnerability Analysis",
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function looksLikeHtml(value: string) {
  return /<\/?(?:a|b|blockquote|br|code|div|em|h[1-6]|i|img|li|ol|p|pre|span|strong|u|ul)\b/i.test(
    value
  );
}

function toEditorHtml(value: string) {
  if (!value) return "";
  if (looksLikeHtml(value)) return value;

  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}

function getContentMetadata(value: string) {
  const html = toEditorHtml(value);

  if (typeof document === "undefined") {
    return {
      imageCount: /<img\b/i.test(html) ? 1 : 0,
      text: value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    };
  }

  const container = document.createElement("div");
  container.innerHTML = html;

  return {
    imageCount: container.querySelectorAll("img").length,
    text: (container.innerText || container.textContent || "")
      .replace(/\s+/g, " ")
      .trim(),
  };
}

function hasMeaningfulContent(value: string) {
  const { imageCount, text } = getContentMetadata(value);
  return imageCount > 0 || text.length > 0;
}

function getNotePreview(value: string) {
  const { imageCount, text } = getContentMetadata(value);

  if (text) {
    return text.length > 50 ? `${text.slice(0, 50)}...` : text;
  }

  if (imageCount > 0) {
    return `${imageCount} print${imageCount > 1 ? "s" : ""} anexado${
      imageCount > 1 ? "s" : ""
    }`;
  }

  return "Sem conteúdo";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Não foi possível ler a imagem colada."));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function PentestNotes() {
  const { projectId } = useParams();
  const editorRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folder, setFolder] = useState("Recon");

  const [saveMode, setSaveMode] = useState<"auto" | "manual">("auto");

  const [folders, setFolders] = useState<string[]>(defaultFolders);

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Carregar notas
  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (saveMode === "manual") {
      return;
    }

    if (!selectedNote && !title.trim() && !hasMeaningfulContent(content)) {
      return;
    }

    const handler = setTimeout(() => {
      handleSaveNote();
    }, 300);

    return () => clearTimeout(handler);
  }, [title, content, folder, selectedNote?.id, saveMode]);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || document.activeElement === editor) {
      return;
    }

    if (editor.innerHTML !== content) {
      editor.innerHTML = content;
    }
  }, [content]);

  async function fetchNotes() {
    const result = await window.electron.getNotes(
      projectId ? Number(projectId) : null
    );

    setNotes(result || []);

    console.log("Fetched notes:", result);
  }

  async function handleSaveNote() {
    const noteTitle = title.trim() || "Nova Nota";

    if (selectedNote && selectedNote.id) {
      const updated = {
        ...selectedNote,
        title: noteTitle,
        content,
        folder,
      };
      await window.electron.updateNote(updated);
      setSelectedNote(updated);
      // Atualiza a lista de notas com a versão mais recente
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === updated.id ? updated : n))
      );
    } else {
      const newNote = await window.electron.createNote({
        project_id: projectId ? Number(projectId) : null,
        title: noteTitle,
        content,
        folder,
      });

      if (newNote) {
        setSelectedNote(newNote);

        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
    }
  }

  function handleSelectNote(note: Note) {
    const noteContent = toEditorHtml(note.content);

    setSelectedNote(note);
    setTitle(note.title);
    setContent(noteContent);
    setFolder(note.folder);

    if (editorRef.current) {
      editorRef.current.innerHTML = noteContent;
    }
  }

  function newNoteForm() {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setFolder("Recon");

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
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

  function handleEditorInput(event: FormEvent<HTMLDivElement>) {
    setContent(event.currentTarget.innerHTML);
  }

  function insertFragmentAtCursor(fragment: DocumentFragment) {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();
    let range: Range | null = null;

    if (selection && selection.rangeCount > 0) {
      const selectedRange = selection.getRangeAt(0);

      if (editor.contains(selectedRange.commonAncestorContainer)) {
        range = selectedRange;
      }
    }

    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    const lastNode = fragment.lastChild;

    range.deleteContents();
    range.insertNode(fragment);

    if (lastNode && selection) {
      range.setStartAfter(lastNode);
      range.setEndAfter(lastNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    setContent(editor.innerHTML);
  }

  function insertPlainTextAtCursor(text: string) {
    const fragment = document.createDocumentFragment();
    const lines = text.split(/\r\n|\r|\n/);

    lines.forEach((line, index) => {
      if (index > 0) {
        fragment.appendChild(document.createElement("br"));
      }

      fragment.appendChild(document.createTextNode(line));
    });

    insertFragmentAtCursor(fragment);
  }

  function insertImageAtCursor(src: string) {
    const fragment = document.createDocumentFragment();
    const image = document.createElement("img");

    image.src = src;
    image.alt = "Print colada";
    image.loading = "lazy";

    fragment.appendChild(image);
    fragment.appendChild(document.createElement("br"));

    insertFragmentAtCursor(fragment);
  }

  async function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const clipboardItems = Array.from(event.clipboardData.items);
    const imageItems = clipboardItems.filter((item) =>
      item.type.startsWith("image/")
    );

    if (imageItems.length > 0) {
      event.preventDefault();

      for (const item of imageItems) {
        const file = item.getAsFile();

        if (!file) continue;

        try {
          const src = await readFileAsDataUrl(file);
          insertImageAtCursor(src);
        } catch (error) {
          console.error("Erro ao colar imagem na nota:", error);
        }
      }

      return;
    }

    const text = event.clipboardData.getData("text/plain");

    if (text) {
      event.preventDefault();
      insertPlainTextAtCursor(text);
    }
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
                            {getNotePreview(note.content)}
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
        <div className="flex items-center space-x-2">
          <Switch
            id="save-mode"
            checked={saveMode === "auto"}
            onCheckedChange={(checked) =>
              setSaveMode(checked ? "auto" : "manual")
            }
          />
          <Label htmlFor="save-mode">Salvar Automaticamente</Label>
        </div>
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
        <div className="relative">
          <div
            ref={editorRef}
            className="note-content-editor w-full h-[65vh] overflow-auto whitespace-pre-wrap break-words bg-[#0f1720] p-3 rounded text-sm text-white focus:ring-0 focus:outline-none"
            contentEditable
            role="textbox"
            aria-label="Conteúdo da nota"
            onInput={handleEditorInput}
            onPaste={handlePaste}
            suppressContentEditableWarning
          />
          {!hasMeaningfulContent(content) && (
            <span className="pointer-events-none absolute left-3 top-3 text-sm text-gray-400">
              Conteúdo da nota
            </span>
          )}
        </div>
        {saveMode === "manual" && (
          <Button onClick={handleSaveNote} className="w-full">
            Salvar Nota
          </Button>
        )}
      </div>
    </div>
  );
}
