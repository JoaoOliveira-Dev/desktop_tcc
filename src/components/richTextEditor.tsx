import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type FormEvent,
} from "react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

function hasMeaningfulContent(value: string) {
  if (!value) return false;

  const container = document.createElement("div");
  container.innerHTML = value;

  return (
    container.querySelectorAll("img").length > 0 ||
    (container.textContent ?? "").trim().length > 0
  );
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

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minHeight = "min-h-[170px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || document.activeElement === editor) {
      return;
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  function updateContent(event: FormEvent<HTMLDivElement>) {
    onChange(event.currentTarget.innerHTML);
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

    onChange(editor.innerHTML);
  }

  function insertPlainText(text: string) {
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

  function insertImage(src: string) {
    const fragment = document.createDocumentFragment();
    const image = document.createElement("img");

    image.src = src;
    image.alt = "Imagem colada";
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
          insertImage(await readFileAsDataUrl(file));
        } catch (error) {
          console.error("Erro ao colar imagem:", error);
        }
      }

      return;
    }

    const text = event.clipboardData.getData("text/plain");

    if (text) {
      event.preventDefault();
      insertPlainText(text);
    }
  }

  return (
    <div className="relative">
      <div
        ref={editorRef}
        className={cn(
          "rich-content-editor w-full overflow-auto rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
          minHeight,
          className
        )}
        contentEditable
        role="textbox"
        onInput={updateContent}
        onPaste={handlePaste}
        suppressContentEditableWarning
      />
      {placeholder && !hasMeaningfulContent(value) && (
        <span className="pointer-events-none absolute left-3 top-2 text-sm text-gray-500 dark:text-gray-400">
          {placeholder}
        </span>
      )}
    </div>
  );
}
