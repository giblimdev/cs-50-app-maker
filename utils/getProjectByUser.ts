// utils/getProjectByUser.ts

"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/auth-client";
import type { Project } from "@/lib/generated/prisma/client";

export function useUserProjects() {
  const { data, isPending, error } = useSession();
  const userId = data?.user?.id;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/projects/projectByUser?userId=${userId}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            json.error || "Erreur lors du chargement des projets."
          );
        }

        setProjects(json);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  return {
    projects,
    loading: loading || isPending,
    error: fetchError || error?.message || null,
  };
}
