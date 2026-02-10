"use client";

import { useState, useEffect, useRef } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("notes");
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("notes", JSON.stringify(notes));
    }
  }, [notes]);

  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags))
  ).sort();

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => note.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    editNote(newNote);
  };

  const editNote = (note: Note) => {
    setCurrentNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(", "));
    setIsEditing(true);
    setTimeout(() => contentRef.current?.focus(), 100);
  };

  const saveNote = () => {
    if (!currentNote) return;

    const tags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setNotes(
      notes.map((n) =>
        n.id === currentNote.id
          ? {
              ...n,
              title: editTitle || "Untitled",
              content: editContent,
              tags,
              updatedAt: Date.now(),
            }
          : n
      )
    );
    setIsEditing(false);
    setCurrentNote(null);
  };

  const deleteNote = (id: string) => {
    if (confirm("Delete this note?")) {
      setNotes(notes.filter((n) => n.id !== id));
      if (currentNote?.id === id) {
        setIsEditing(false);
        setCurrentNote(null);
      }
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={saveNote}
            className="text-indigo-600 font-semibold text-lg"
          >
            Done
          </button>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 text-lg font-semibold outline-none"
            placeholder="Note title"
          />
          <button
            onClick={() => currentNote && deleteNote(currentNote.id)}
            className="text-red-500"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col p-4">
          <textarea
            ref={contentRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 outline-none resize-none text-base"
            placeholder="Start typing..."
          />
        </div>

        <div className="border-t border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="work, personal, ideas"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
            <span className="text-sm text-gray-500">{notes.length} notes</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search notes..."
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {allTags.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {notes.length === 0 ? (
              <div>
                <p className="text-lg mb-2">No notes yet</p>
                <p className="text-sm">Tap the + button to create one</p>
              </div>
            ) : (
              <p>No notes match your search</p>
            )}
          </div>
        )}

        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => editNote(note)}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 active:bg-gray-50 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-1">{note.title}</h3>
            {note.content && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {note.content}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-1 flex-wrap">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <span>{formatDate(note.updatedAt)}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={createNote}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}
