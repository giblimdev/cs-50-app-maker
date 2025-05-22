// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string().optional(),
  image: z.string().url("URL invalide").optional().nullable().or(z.literal("")), // ← CORRIGÉ
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

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des projets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données avec gestion des valeurs null pour image
    const validatedData = projectSchema.parse(body);

    // Créer un utilisateur temporaire si aucun n'existe
    let tempUser = await prisma.user.findFirst({
      where: { email: "temp@example.com" },
    });

    if (!tempUser) {
      tempUser = await prisma.user.create({
        data: {
          name: "Utilisateur Temporaire",
          email: "temp@example.com",
          role: "USER",
        },
      });
    }

    // Préparation des données pour l'API
    const projectData = {
      name: validatedData.name,
      description: validatedData.description || null,
      image: validatedData.image || null, // Gère null, undefined, et chaîne vide
      status: validatedData.status,
      priority: validatedData.priority,
      startDate: validatedData.startDate
        ? new Date(validatedData.startDate)
        : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      creatorId: tempUser.id,
    };

    const project = await prisma.project.create({
      data: projectData,
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
        },
        _count: {
          select: {
            users: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Erreur de validation:", error.errors);
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

    console.error("Erreur lors de la création du projet:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la création du projet",
        error:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
      },
      { status: 500 }
    );
  }
}
