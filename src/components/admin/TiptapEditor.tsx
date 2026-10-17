"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { MediaPicker } from "./MediaPicker";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#1F4D3A] underline font-medium hover:text-[#163B2C]",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-2xl max-w-full my-4 border border-[#E8D9CD] shadow-sm",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "w-full border-collapse border border-[#E8D9CD] my-4 rounded-xl overflow-hidden",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "bg-[#FFF8F0] border border-[#E8D9CD] p-3 font-bold text-left text-xs uppercase text-[#1F4D3A]",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-[#E8D9CD] p-3 text-sm text-[#2B2622]",
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose max-w-none p-4 min-h-[220px] focus:outline-none text-[#2B2622] leading-relaxed text-sm",
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("Enter destination URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImageFromMedia = (asset: { url: string; altText?: string | null }) => {
    editor
      .chain()
      .focus()
      .setImage({
        src: asset.url,
        alt: asset.altText || "Article image",
      })
      .run();
  };

  return (
    <div className="rounded-2xl border border-[#E8D9CD] overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#1F4D3A]">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#FFF8F0] border-b border-[#E8D9CD] text-[#2B2622]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 transition-colors ${
            editor.isActive("bold") ? "bg-[#1F4D3A] text-white" : ""
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 transition-colors ${
            editor.isActive("italic") ? "bg-[#1F4D3A] text-white" : ""
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-[#E8D9CD] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-[#1F4D3A] text-white" : ""
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 transition-colors ${
            editor.isActive("heading", { level: 3 }) ? "bg-[#1F4D3A] text-white" : ""
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-[#E8D9CD] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 transition-colors ${
            editor.isActive("bulletList") ? "bg-[#1F4D3A] text-white" : ""
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 transition-colors ${
            editor.isActive("orderedList") ? "bg-[#1F4D3A] text-white" : ""
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 transition-colors ${
            editor.isActive("blockquote") ? "bg-[#1F4D3A] text-white" : ""
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-[#E8D9CD] mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 transition-colors ${
            editor.isActive("link") ? "bg-[#1F4D3A] text-white" : ""
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <MediaPicker
          buttonLabel="Insert Image"
          onSelect={addImageFromMedia}
        />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          className="p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 transition-colors"
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-[#E8D9CD] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 disabled:opacity-40"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg hover:bg-[#F4DFCB]/60 disabled:opacity-40"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
