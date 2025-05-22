"use client";

import React, { JSX, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Save, Edit } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type PromptCardProps = {
  tableName: string;
  tableParent: string;
  commonMessage: string;
};

function capitalize(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function PromptCardGenerator({
  tableName,
  tableParent,
  commonMessage,
}: PromptCardProps): JSX.Element {
  const upperTableName = capitalize(tableName);
  const upperTableParent = capitalize(tableParent);
  const camelTableName = tableName.charAt(0).toLowerCase() + tableName.slice(1);

  // État pour gérer l'édition
  const [editableCards, setEditableCards] = useState([
    {
      title: `api/${camelTableName}/${camelTableName}By${upperTableParent}/route.ts`,
      body: `${commonMessage}\n\`app/api/${camelTableName}/${camelTableName}By${upperTableParent}/route.ts\` 
      doit :\n- Implémenter GET (récupération par Id${tableParent})\n
      - Implémenter POST (création avec validation)\n
      - Gérer les erreurs clairement\n
      - Utiliser Prisma : \`{ prisma } from "@/lib/prisma"\n
      - Types depuis @/lib/generated/prisma/client`,
    },
    {
      title: `utils/get${upperTableName}.ts`,
      body: `${commonMessage}\n\`utils/get${upperTableName}.ts\` doit :\n- Exporter \`async function get${upperTableName}(${tableParent}Id: string)\`\n- Vérifier la validité de l'ID\n- Utiliser le store Zustand pour le cache\n- Appeler l'API : \`/api/${camelTableName}/${camelTableName}By${upperTableParent}?${tableParent}Id=\${${tableParent}Id}\`\n- Gérer les états loading/error`,
    },
    {
      title: `components/${camelTableName}Select.tsx`,
      body: `${commonMessage}\
      n\`components/${camelTableName}Select.tsx\` doit :\n
      - Accepter \`Id${tableParent}: string\` de puis le store use${tableParent}Store.ts\n
      - Afficher un message si ID manquant\n
      - Utiliser \`get${upperTableName}\` pour le fetching\n
      - Mettre à jour \`use${upperTableName}Store\` on select\n
      -afficher les icone lucide-react modifier supprimer\n 
      -afficher un boutton ajouter qui vide le store use${upperTableName}Store.ts\n e ouvre le composant components/${camelTableName}Crud.tsx 
      
      `,
    },
    {
      title: `components/${camelTableName}Crud.tsx`,
      body: `${commonMessage}\
      n\`components/${camelTableName}Crud.tsx\` doit :\n
      - verifier le store use${tableParent}Store.ts pour l'Id${tableParent}\n 
      - creer ou modifier un ${camelTableName}\n ou modifier un ${camelTableName} existant\n cf store
      - Afficher un message si ID manquant\n
      - Utiliser \`get${upperTableName}\` pour le fetching\n
      - Mettre à jour \`use${upperTableName}Store\` on select\n
      
      `,
    },
  ]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSave = () => {
    setEditingIndex(null);
    toast.success("Modifications enregistrées");
  };

  const handleChange = (index: number, value: string) => {
    const updatedCards = [...editableCards];
    updatedCards[index] = { ...updatedCards[index], body: value };
    setEditableCards(updatedCards);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers");
  };

  return (
    <div className="grid gap-6">
      {editableCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold">
              {card.title}
            </CardTitle>
            <div className="flex gap-2">
              {editingIndex === index ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  title="Enregistrer"
                >
                  <Save className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(index)}
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(card.body)}
                title="Copier"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingIndex === index ? (
              <Textarea
                value={card.body}
                onChange={(e) => handleChange(index, e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm">{card.body}</pre>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default PromptCardGenerator;
