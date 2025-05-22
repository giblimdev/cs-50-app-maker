// components/comment/CommentCrud.tsx
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Comment } from "@/lib/generated/prisma/client";
import { useSession } from "@/lib/auth/auth-client";

// Schéma de validation aligné avec le modèle Prisma
const commentSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  content: z.string().min(1, "Le contenu est requis"),
  projectId: z.string().uuid().nullable().optional(),
  parentCommentId: z.string().uuid().nullable().optional(),
  authorId: z.string().nullable(), // Modifié : string ou null, sans validation UUID
});

// Type pour les données du formulaire (sans les champs auto-générés)
type CommentFormData = Omit<z.infer<typeof commentSchema>, "authorId">;

// Type étendu pour le Comment avec les relations
type CommentWithRelations = Comment & {
  author?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  project?: {
    id: string;
    name: string;
  };
  parentComment?: {
    id: string;
    title: string;
  };
};

interface CommentCrudProps {
  comment?: CommentWithRelations | null;
  projectId?: string;
  parentCommentId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function CommentCrud({
  comment,
  projectId,
  parentCommentId,
  onSave,
  onCancel,
}: CommentCrudProps) {
  const { data: session, isPending } = useSession();
  const [formData, setFormData] = useState<CommentFormData>({
    title: "",
    content: "",
    projectId: projectId || null,
    parentCommentId: parentCommentId || null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Débogage de la session Better Auth
  useEffect(() => {
    console.log("=== DÉBOGAGE Better Auth Session ===");
    console.log("Session complète:", session);
    console.log("Session user:", session?.user);
    console.log("User ID:", session?.user?.id);
    console.log("Type de User ID:", typeof session?.user?.id);
  }, [session]);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (comment) {
      setFormData({
        title: comment.title,
        content: comment.content,
        projectId: comment.projectId || projectId || null,
        parentCommentId: comment.parentCommentId || parentCommentId || null,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        projectId: projectId || null,
        parentCommentId: parentCommentId || null,
      }));
    }
  }, [comment, projectId, parentCommentId]);

  const handleChange = (field: keyof CommentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null, // Convertir les chaînes vides en null
    }));

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // États de chargement et d'authentification
  if (isPending) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement de la session...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Préparer les données avec l'authorId (peut être null)
      const dataToValidate = {
        title: formData.title,
        content: formData.content,
        projectId: formData.projectId || null,
        parentCommentId: formData.parentCommentId || null,
        authorId: session?.user?.id || null, // Peut être null
      };

      console.log("Données à valider:", dataToValidate);

      // Validation avec Zod
      const validatedData = commentSchema.parse(dataToValidate);

      console.log("Données validées:", validatedData);

      // Appel API
      const url = comment ? `/api/comments/${comment.id}` : "/api/comments";
      const method = comment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      // Succès
      onSave();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);

      if (error instanceof z.ZodError) {
        // Erreurs de validation Zod
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Autres erreurs (réseau, serveur, etc.)
        setErrors({
          submit:
            error instanceof Error
              ? error.message
              : "Erreur lors de la sauvegarde",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isReply = !!parentCommentId;
  const isEdit = !!comment;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit
              ? "Modifier le commentaire"
              : isReply
                ? "Répondre au commentaire"
                : "Nouveau commentaire"}
          </h2>
          {session?.user && (
            <p className="text-sm text-gray-600 mt-1">
              Connecté en tant que{" "}
              <span className="font-medium">
                {session.user.name || session.user.email || "Utilisateur"}
              </span>
              {session.user.id && (
                <span className="text-xs text-gray-400 ml-2">
                  (ID: {session.user.id.slice(0, 8)}...)
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Fermer"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titre */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Titre du commentaire"
            maxLength={200}
            required
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/200 caractères
          </p>
        </div>

        {/* Contenu */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Contenu <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleChange("content", e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
              errors.content ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Contenu du commentaire..."
            required
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {/* Informations contextuelles */}
        {(formData.projectId ||
          formData.parentCommentId ||
          comment?.project ||
          comment?.parentComment) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Contexte du commentaire
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              {(formData.projectId || comment?.project) && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>
                    Projet: {comment?.project?.name || formData.projectId}
                  </span>
                </div>
              )}
              {(formData.parentCommentId || comment?.parentComment) && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  <span>
                    En réponse à:{" "}
                    {comment?.parentComment?.title || formData.parentCommentId}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Erreur générale */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600 text-sm font-medium">
                {errors.submit}
              </p>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg font-medium transition-colors duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={
              loading || !formData.title.trim() || !formData.content.trim()
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 min-w-[100px] justify-center"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isEdit ? "Modifier" : isReply ? "Répondre" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}
