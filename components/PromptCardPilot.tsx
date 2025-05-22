// ✅ Chemin du fichier : app/components/prompt/PromptCardPage.tsx

"use client";

import React, { useState, JSX } from "react";
import PromptCardGenerator from "@/components/PromptCardGenerator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function PromptCardPage(): JSX.Element {
  const [tableName, setTableName] = useState<string>("feature");
  const [tableParent, setTableParent] = useState<string>("project");
  const [commonMessage, setCommonMessage] = useState<string>(`
    - Dans mon application Next.js version 15+, 
    - les scripts sont écrits en TypeScript et sont fortement typés. 
    - Ce fichier fait partie de l'architecture modulaire de l'application. 
    - Il assure la cohérence entre la base de données Prisma, l’API, le store Zustand et les composants React.
    - en accord avec mon schema en pj, dis moi si tu as besoin du schema. 
    - ajoute au debut du script en commentaire le nom du fichier 
    - donnes moi un scrip complet et fonctionel.
    - evite l'utlisation de any et soit attentif a ecrir des message d'erreur explicites
     `);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Générateur de prompts personnalisé</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tableName" className="block font-medium mb-1">
            Nom de la table enfant :
          </label>
          <Input
            id="tableName"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="ex: feature"
            required
          />
        </div>

        <div>
          <label htmlFor="tableParent" className="block font-medium mb-1">
            Nom de la table parent :
          </label>
          <Input
            id="tableParent"
            value={tableParent}
            onChange={(e) => setTableParent(e.target.value)}
            placeholder="ex: project"
            required
          />
        </div>

        <div>
          <label htmlFor="commonMessage" className="block font-medium mb-1">
            Message commun :
          </label>
          <Textarea
            id="commonMessage"
            value={commonMessage}
            onChange={(e) => setCommonMessage(e.target.value)}
            rows={6}
            required
          />
        </div>

        <Button type="submit">Générer les prompts</Button>
      </form>

      {submitted && (
        <PromptCardGenerator
          tableName={tableName}
          tableParent={tableParent}
          commonMessage={commonMessage}
        />
      )}
    </div>
  );
}

export default PromptCardPage;
