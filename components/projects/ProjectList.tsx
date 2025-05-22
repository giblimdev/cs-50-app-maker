// components/project/ProjectList.tsx
"use client";

import { useState, useEffect } from "react";
import { Project, Status, Role } from "@/lib/generated/prisma/client";
import ProjectCrud from "./ProjectCrud";

interface ProjectWithRelations extends Project {
  users?: {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
  }[];
  comments?: {
    id: string;
    title: string;
    createdAt: Date;
    author: {
      name: string | null;
      email: string | null;
    };
  }[];
  _count?: {
    users: number;
    comments: number;
  };
}

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] =
    useState<ProjectWithRelations | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectSaved = () => {
    fetchProjects();
    setShowAddModal(false);
    setEditingProject(null);
  };

  const handleEdit = (project: ProjectWithRelations) => {
    setEditingProject(project);
    setShowAddModal(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProjects();
      } else {
        alert("Erreur lors de la suppression du projet");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du projet");
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      case "BLOCKED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case "TODO":
        return "À faire";
      case "IN_PROGRESS":
        return "En cours";
      case "REVIEW":
        return "En révision";
      case "DONE":
        return "Terminé";
      case "BLOCKED":
        return "Bloqué";
      case "CANCELLED":
        return "Annulé";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-red-600 font-semibold";
    if (priority >= 3) return "text-orange-600 font-medium";
    if (priority >= 2) return "text-yellow-600";
    return "text-gray-600";
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
          <h2 className="text-2xl font-bold text-gray-900">Projets</h2>
          <p className="text-gray-600 mt-1">
            {projects.length} projet{projects.length > 1 ? "s" : ""} au total
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
          Ajouter un projet
        </button>
      </div>

      {/* Liste des projets */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun projet
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier projet.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Créer un projet
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* En-tête du projet */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {project.image && (
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                  </div>
                  {project.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleEdit(project)}
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
                    onClick={() => handleDelete(project.id)}
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                  <span
                    className={`text-sm ${getPriorityColor(project.priority)}`}
                  >
                    Priorité {project.priority}
                  </span>
                </div>

                {(project.startDate || project.endDate) && (
                  <div className="text-sm text-gray-600">
                    {project.startDate && (
                      <div>
                        Début:{" "}
                        {new Date(project.startDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    )}
                    {project.endDate && (
                      <div>
                        Fin:{" "}
                        {new Date(project.endDate).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                )}

                {project._count && (
                  <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      {project._count.users}
                    </span>
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
                      {project._count.comments}
                    </span>
                  </div>
                )}

                {project.comments && project.comments.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-1">
                      Derniers commentaires:
                    </div>
                    {project.comments.slice(0, 2).map((comment) => (
                      <div
                        key={comment.id}
                        className="text-xs bg-gray-50 p-2 rounded mb-1"
                      >
                        <div className="font-medium">{comment.title}</div>
                        <div className="text-gray-500">
                          par {comment.author.name || comment.author.email} -{" "}
                          {new Date(comment.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal ProjectCrud */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectCrud
              project={editingProject}
              onSave={handleProjectSaved}
              onCancel={() => {
                setShowAddModal(false);
                setEditingProject(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
