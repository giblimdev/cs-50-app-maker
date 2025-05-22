// stores/useProjectStore.ts

import { create } from "zustand";
import type { Project } from "@/lib/generated/prisma/client";

interface ProjectStore {
  selectedProject: Project | null;
  setSelectedProject: (project: Project) => void;
  clearSelectedProject: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  selectedProject: null,

  setSelectedProject: (project) => set({ selectedProject: project }),

  clearSelectedProject: () => set({ selectedProject: null }),
}));
