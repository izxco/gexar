import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import * as Crypto from "expo-crypto";
import { Cache, CACHE_KEYS } from "@/lib/cache";
import type { Icon3DName } from "@/lib/brand";

/** Notion-style block types. */
export type BlockType = "text" | "h1" | "h2" | "todo" | "bullet" | "quote";

export interface NoteBlock {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
}

export interface NotePage {
  id: string;
  title: string;
  icon: Icon3DName;
  pinned: boolean;
  blocks: NoteBlock[];
  createdAt: string;
  updatedAt: string;
}

export const PAGE_ICONS: Icon3DName[] = [
  "notebook", "fileText", "bulb", "target", "star", "bookmark",
  "folder", "calendar", "rocket", "heart", "pencil", "trophy",
];

export function newBlock(type: BlockType = "text", text = ""): NoteBlock {
  return { id: Crypto.randomUUID(), type, text, checked: type === "todo" ? false : undefined };
}

/** Short plain-text preview of a page's content. */
export function pagePreview(page: NotePage): string {
  return page.blocks
    .map((b) => b.text.trim())
    .filter(Boolean)
    .join(" · ")
    .slice(0, 120);
}

export function todoProgress(page: NotePage): { done: number; total: number } {
  const todos = page.blocks.filter((b) => b.type === "todo");
  return { done: todos.filter((b) => b.checked).length, total: todos.length };
}

function welcomePage(): NotePage {
  const now = new Date().toISOString();
  return {
    id: Crypto.randomUUID(),
    title: "Benvenuto in Notes",
    icon: "bulb",
    pinned: true,
    createdAt: now,
    updatedAt: now,
    blocks: [
      newBlock("h2", "Organizza tutto in pagine"),
      newBlock("text", "Ogni pagina è fatta di blocchi: testo, titoli, liste, citazioni e to-do. Usa la barra sopra la tastiera per cambiare il tipo di blocco."),
      newBlock("todo", "Crea la tua prima pagina"),
      newBlock("todo", "Fissa in alto le pagine importanti"),
      newBlock("bullet", "A capo crea un nuovo blocco"),
      newBlock("bullet", "Cancella su un blocco vuoto per unirlo al precedente"),
      newBlock("quote", "Le note restano solo su questo telefono, come il resto di Gexar."),
    ],
  };
}

type NotesContextType = {
  pages: NotePage[];
  getPage: (id: string) => NotePage | undefined;
  createPage: () => NotePage;
  updatePage: (id: string, patch: Partial<Omit<NotePage, "id" | "createdAt">>) => void;
  removePage: (id: string) => void;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within a NotesProvider");
  return ctx;
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<NotePage[]>(() => {
    const cached = Cache.get<NotePage[]>(CACHE_KEYS.NOTES_PAGES);
    if (cached) return cached;
    const seeded = [welcomePage()];
    Cache.set(CACHE_KEYS.NOTES_PAGES, seeded);
    return seeded;
  });

  const commit = useCallback((updater: (prev: NotePage[]) => NotePage[]) => {
    setPages((prev) => {
      const next = updater(prev);
      Cache.set(CACHE_KEYS.NOTES_PAGES, next);
      return next;
    });
  }, []);

  const getPage = useCallback((id: string) => pages.find((p) => p.id === id), [pages]);

  const createPage = useCallback(() => {
    const now = new Date().toISOString();
    const page: NotePage = {
      id: Crypto.randomUUID(),
      title: "",
      icon: PAGE_ICONS[Math.floor(Math.random() * PAGE_ICONS.length)],
      pinned: false,
      blocks: [newBlock("text")],
      createdAt: now,
      updatedAt: now,
    };
    commit((prev) => [page, ...prev]);
    return page;
  }, [commit]);

  const updatePage = useCallback(
    (id: string, patch: Partial<Omit<NotePage, "id" | "createdAt">>) =>
      commit((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p))
      ),
    [commit]
  );

  const removePage = useCallback(
    (id: string) => commit((prev) => prev.filter((p) => p.id !== id)),
    [commit]
  );

  return (
    <NotesContext.Provider value={{ pages, getPage, createPage, updatePage, removePage }}>
      {children}
    </NotesContext.Provider>
  );
}
