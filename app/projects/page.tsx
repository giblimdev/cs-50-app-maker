// app/projects/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import ProjectList from "@/components/projects/ProjectList";
import { Status } from "@/lib/generated/prisma/client";

interface ProjectStats {
  total: number;
  byStatus: Record<Status, number>;
  thisMonth: number;
  activeUsers: number;
}

export default function ProjectsPage() {
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    byStatus: {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
      BLOCKED: 0,
      CANCELLED: 0,
    },
    thisMonth: 0,
    activeUsers: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<Status | "">("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Charger les statistiques des projets
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const projects = await response.json();

          // Calculer les statistiques
          const total = projects.length;
          const byStatus = projects.reduce(
            (acc: Record<Status, number>, project: any) => {
              const status = project.status as Status;
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            },
            {
              TODO: 0,
              IN_PROGRESS: 0,
              REVIEW: 0,
              DONE: 0,
              BLOCKED: 0,
              CANCELLED: 0,
            }
          );

          // Projets créés ce mois
          const thisMonth = new Date();
          thisMonth.setDate(1);
          const thisMonthCount = projects.filter(
            (project: any) => new Date(project.createdAt) >= thisMonth
          ).length;

          // Utilisateurs actifs (approximation basée sur les projets avec utilisateurs)
          const activeUsers = projects.reduce(
            (acc: Set<string>, project: any) => {
              if (project.users) {
                project.users.forEach((user: any) => acc.add(user.id));
              }
              return acc;
            },
            new Set()
          ).size;

          setStats({
            total,
            byStatus,
            thisMonth: thisMonthCount,
            activeUsers,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Projets
              </h1>
              <p className="mt-2 text-gray-600">
                Organisez et suivez l'avancement de tous vos projets
              </p>
            </div>

            {/* Icône décorative */}
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total des projets */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Projets
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "-" : stats.total}
                </p>
              </div>
            </div>
          </div>

          {/* Projets en cours */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "-" : stats.byStatus.IN_PROGRESS}
                </p>
              </div>
            </div>
          </div>

          {/* Projets terminés */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "-" : stats.byStatus.DONE}
                </p>
              </div>
            </div>
          </div>

          {/* Ce mois */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ce Mois</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "-" : stats.thisMonth}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtre par statut */}
            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Filtrer par statut
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as Status | "")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="REVIEW">En révision</option>
                <option value="DONE">Terminé</option>
                <option value="BLOCKED">Bloqué</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>

            {/* Filtre par priorité */}
            <div>
              <label
                htmlFor="priority-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Filtrer par priorité
              </label>
              <select
                id="priority-filter"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les priorités</option>
                <option value="1">1 - Très faible</option>
                <option value="2">2 - Faible</option>
                <option value="3">3 - Moyenne</option>
                <option value="4">4 - Élevée</option>
                <option value="5">5 - Critique</option>
              </select>
            </div>

            {/* Bouton de réinitialisation */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedStatus("");
                  setSelectedPriority("");
                }}
                disabled={!selectedStatus && !selectedPriority}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg font-medium transition-colors duration-200"
              >
                Réinitialiser
              </button>
            </div>

            {/* Informations sur les filtres actifs */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600 space-y-1">
                {selectedStatus && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedStatus)}`}
                  >
                    {getStatusLabel(selectedStatus)}
                  </span>
                )}
                {selectedPriority && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ml-2">
                    Priorité {selectedPriority}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Répartition par statut */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Répartition par statut
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status as Status)}`}
                  >
                    {getStatusLabel(status as Status)}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Composant ProjectList */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <ProjectList />
          </div>
        </div>

        {/* Section d'aide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                À propos de la gestion de projets
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Organisez efficacement vos projets avec un suivi complet de
                  leur avancement. Gérez les équipes, définissez les priorités
                  et suivez les délais pour garantir le succès de vos projets.
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>
                    Créez des projets avec des descriptions détaillées et des
                    images
                  </li>
                  <li>
                    Définissez des statuts et priorités pour un suivi optimal
                  </li>
                  <li>Assignez des équipes et collaborateurs à vos projets</li>
                  <li>
                    Suivez les dates de début et de fin pour respecter les
                    délais
                  </li>
                  <li>
                    Utilisez les filtres pour naviguer rapidement dans vos
                    projets
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
