// @/components/TodoButton.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TodoItem {
  id: string;
  text: string;
}

export default function TodoButton() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("todos");
    if (stored) setTodos(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const newItem: TodoItem = { id: crypto.randomUUID(), text: newTodo };
    setTodos((prev) => [...prev, newItem]);
    setNewTodo("");
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((item) => item.id !== id));
  };

  const exportTodos = () => {
    const data = JSON.stringify(todos);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todos-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTodos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTodos = JSON.parse(content);
        if (Array.isArray(importedTodos)) {
          setTodos(importedTodos);
        }
      } catch (error) {
        console.error("Error parsing file", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="ml-auto bg-slate-800 text-white hover:bg-slate-700"
        >
          📝 TODO
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 text-white border border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white">Mes Actions</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {todos.length === 0 ? (
            <p className="text-sm text-slate-300">Aucune action enregistrée.</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center bg-slate-700 px-3 py-2 rounded-md text-sm"
                >
                  <span>{item.text}</span>
                  <Button
                    onClick={() => deleteTodo(item.id)}
                    variant="ghost"
                    className="text-red-400 hover:text-red-600"
                    size="sm"
                  >
                    🗑️
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Nouvelle tâche"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="bg-white text-black"
            />
            <Button
              onClick={addTodo}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ajouter
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={exportTodos}
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Exporter
            </Button>
            <Button
              variant="outline"
              className="bg-purple-600 hover:bg-purple-700 text-white relative"
            >
              Importer
              <input
                type="file"
                accept=".json"
                onChange={importTodos}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
