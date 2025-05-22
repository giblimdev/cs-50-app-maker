"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import TodoButton from "@/components/layout/TodoButton";
import PromptCardPilot from "@/components/PromptCardPilot";

const commandes = {
  Installation: [
    {
      name: "Installer un nouveau projet Next.js",
      prompt:
        "Crée une application Next.js en utilisant l'App Router (version 15+), sans le dossier src. L'application doit être configurée avec TypeScript pour un typage fort.",
      order: 1,
    },
    {
      name: "modifier creer une architecture",
      prompt:
        "Crée une application Next.js en utilisant l'App Router (version 15+), sans le dossier src. L'application doit être configurée avec TypeScript pour un typage fort.donne moi l'achitecture complete, pour realiser cette apllication",
      order: 2,
    },
  ],
  Création: [
    {
      name: "Écrire un script",
      prompt:
        "Écris le script de ce fichier en TypeScript (strict mode). Affiche le chemin du fichier en commentaire. Les variables doivent être fortement typées.",
      order: 1,
    },
    {
      name: "Créer un composant React",
      prompt:
        "Crée un composant React fonctionnel en TypeScript, nommé MyComponent. Il doit accepter des props typées et utiliser useState.",
      order: 2,
    },
    {
      name: "Créer une page Next.js (App Router)",
      prompt:
        "Crée une page dans l'App Router de Next.js pour le chemin '/dashboard'. La page doit être un Server Component par défaut.",
      order: 3,
    },
  ],
  Correction: [
    {
      name: "Corriger erreurs TypeScript",
      prompt:
        "Examine le code suivant et corrige toutes les erreurs de typage TypeScript.",
      order: 1,
    },
    {
      name: "Optimiser performance",
      prompt:
        "Analyse le code suivant et propose des optimisations pour améliorer la performance, notamment en termes de rendu ou de requêtes.",
      order: 2,
    },
    {
      name: "Déboguer un bug",
      prompt:
        "Voici un extrait de code et la description d'un bug. Identifie la cause du bug et propose une solution corrigée.",
      order: 3,
    },
  ],
  Projet: [
    {
      name: "Décrire architecture projet",
      prompt:
        "Décris l'architecture recommandée pour un projet Next.js de taille moyenne avec un backend séparé (Node.js/Express) et une base de données PostgreSQL.",
      order: 1,
    },
    {
      name: "Planifier prochaines étapes",
      prompt:
        "En se basant sur les fonctionnalités actuelles et les objectifs futurs, propose une liste de prochaines étapes pour le développement du projet.",
      order: 2,
    },
  ],
};

const categoryColors: { [key: string]: string } = {
  Installation: "bg-blue-100",
  Création: "bg-green-100",
  Correction: "bg-yellow-100",
  Projet: "bg-purple-100",
};

const Commandes = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (prompt: string, index: string) => {
    navigator.clipboard.writeText(prompt);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="m-5 p-5 border rounded-2xl bg-green-300">
        <PromptCardPilot />
      </div>

      <div>
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          ⚡ Prompts utiles pour développer efficacement
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(commandes).map(([category, items]) => {
            const bgColorClass = categoryColors[category] || "bg-white";

            return (
              <div
                key={category}
                className={`${bgColorClass} rounded-xl shadow p-5 flex flex-col gap-4`}
              >
                <h2 className=" text-lg font-bold text-gray-300 rounded-xl border-b p-2 bg-black">
                  {category}
                </h2>

                {items
                  .filter((item) => item.name && item.prompt)
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {item.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(item.prompt, `${category}-${index}`)
                          }
                          className="hover:bg-gray-100"
                          aria-label="Copier le prompt"
                        >
                          {copied === `${category}-${index}` ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md font-mono whitespace-pre-wrap">
                        {item.prompt}
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>{" "}
      </div>

      <div className="mt-10 flex justify-center">
        <TodoButton />
      </div>
    </div>
  );
};

export default Commandes;
