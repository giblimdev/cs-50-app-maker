// components/comment/CommentList.tsx
"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/lib/generated/prisma/client";
import CommentCrud from "@/components/Comments/CommentCrud";

interface CommentWithRelations extends Comment {
  author: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  parentComment?: {
    id: string;
    title: string;
    author: {
      name: string | null;
      email: string | null;
    };
  } | null;
  childComments?: CommentWithRelations[];
  project?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    childComments: number;
  };
}

interface CommentListProps {
  projectId?: string;
  featureId?: string;
  parentCommentId?: string;
}

export default function CommentList({
  projectId,
  featureId,
  parentCommentId,
}: CommentListProps) {
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingComment, setEditingComment] =
    useState<CommentWithRelations | null>(null);
  const [replyingTo, setReplyingTo] = useState<CommentWithRelations | null>(
    null
  );

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (projectId) params.append("projectId", projectId);
      if (featureId) params.append("featureId", featureId);
      if (parentCommentId) params.append("parentCommentId", parentCommentId);

      const response = await fetch(`/api/comments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId, featureId, parentCommentId]);

  const handleCommentSaved = () => {
    fetchComments();
    setShowAddModal(false);
    setEditingComment(null);
    setReplyingTo(null);
  };

  const handleEdit = (comment: CommentWithRelations) => {
    setEditingComment(comment);
    setShowAddModal(true);
  };

  const handleReply = (comment: CommentWithRelations) => {
    setReplyingTo(comment);
    setShowAddModal(true);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchComments();
      } else {
        alert("Erreur lors de la suppression du commentaire");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du commentaire");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Commentaires</h2>
          <p className="text-gray-600 mt-1">
            {comments.length} commentaire{comments.length > 1 ? "s" : ""} au
            total
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
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
          Ajouter un commentaire
        </button>
      </div>

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun commentaire
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier commentaire.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Créer un commentaire
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* En-tête du commentaire */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3 flex-1">
                  {comment.author.image ? (
                    <img
                      src={comment.author.image}
                      alt={comment.author.name || "Avatar"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {comment.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span>{comment.author.name || comment.author.email}</span>
                      <span>•</span>
                      <span>{formatDate(comment.createdAt)}</span>
                      {comment.parentComment && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">
                            En réponse à "{comment.parentComment.title}"
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleReply(comment)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Répondre"
                  >
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
                  </button>
                  <button
                    onClick={() => handleEdit(comment)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Modifier"
                  >
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                <div className="flex items-center gap-4">
                  {comment.project && (
                    <span className="flex items-center gap-1">
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
                      {comment.project.name}
                    </span>
                  )}
                  {comment._count && comment._count.childComments > 0 && (
                    <span className="flex items-center gap-1">
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {comment._count.childComments} réponse
                      {comment._count.childComments > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Commentaires enfants */}
              {comment.childComments && comment.childComments.length > 0 && (
                <div className="mt-4 ml-6 space-y-3 border-l-2 border-gray-100 pl-4">
                  {comment.childComments.map((childComment) => (
                    <div
                      key={childComment.id}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        {childComment.author.image ? (
                          <img
                            src={childComment.author.image}
                            alt={childComment.author.name || "Avatar"}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <span className="font-medium">
                              {childComment.author.name ||
                                childComment.author.email}
                            </span>
                            <span>•</span>
                            <span>{formatDate(childComment.createdAt)}</span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {childComment.title}
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {childComment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal CommentCrud */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CommentCrud
              comment={
                editingComment
                  ? {
                      ...editingComment,
                      project: editingComment.project ?? undefined,
                      parentComment: editingComment.parentComment ?? undefined,
                    }
                  : editingComment
              }
              projectId={projectId}
              parentCommentId={replyingTo?.id || parentCommentId}
              onSave={handleCommentSaved}
              onCancel={() => {
                setShowAddModal(false);
                setEditingComment(null);
                setReplyingTo(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
