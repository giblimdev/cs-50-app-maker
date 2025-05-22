// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  image: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum([
    "TODO",
    "IN_PROGRESS",
    "REVIEW",
    "DONE",
    "BLOCKED",
    "CANCELLED",
  ]),
  priority: z.number().min(1).max(5),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← MODIFIÉ
) {
  try {
    const { id } = await params; // ← AJOUTÉ

    const project = await prisma.project.findUnique({
      where: { id }, // ← MODIFIÉ
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            parentComment: {
              select: {
                id: true,
                title: true,
                author: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            childComments: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            users: true,
            comments: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Projet non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération du projet" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← MODIFIÉ
) {
  try {
    const { id } = await params; // ← AJOUTÉ
    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    // Vérifier si le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id }, // ← MODIFIÉ
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: "Projet non trouvé" },
        { status: 404 }
      );
    }

    const project = await prisma.project.update({
      where: { id }, // ← MODIFIÉ
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        image: validatedData.image || null,
        status: validatedData.status,
        priority: validatedData.priority,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        comments: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            author: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        _count: {
          select: {
            users: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Données invalides",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la mise à jour du projet:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du projet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← MODIFIÉ
) {
  try {
    const { id } = await params; // ← AJOUTÉ

    // Vérifier si le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id }, // ← MODIFIÉ
      include: {
        _count: {
          select: {
            comments: true,
            users: true,
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le projet
    await prisma.project.delete({
      where: { id }, // ← MODIFIÉ
    });

    return NextResponse.json({
      message: "Projet supprimé avec succès",
      deletedProject: {
        id: existingProject.id,
        name: existingProject.name,
        commentsCount: existingProject._count.comments,
        usersCount: existingProject._count.users,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du projet" },
      { status: 500 }
    );
  }
}
