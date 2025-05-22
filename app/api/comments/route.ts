// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  projectId: z.string().uuid().nullable().optional(),
  parentCommentId: z.string().uuid().nullable().optional(),
  authorId: z.string().nullable(), // Modifié : string ou null
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const parentCommentId = searchParams.get("parentCommentId");

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (parentCommentId) where.parentCommentId = parentCommentId;
    else where.parentCommentId = null; // Récupérer les commentaires racine par défaut

    const comments = await prisma.comment.findMany({
      where,
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
                email: true,
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
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            childComments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des commentaires" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    // Vérifier que l'utilisateur existe seulement si authorId est fourni
    if (validatedData.authorId) {
      const userExists = await prisma.user.findUnique({
        where: { id: validatedData.authorId },
      });

      if (!userExists) {
        return NextResponse.json(
          { message: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }
    }

    // Vérifier que le projet existe si projectId est fourni
    if (validatedData.projectId) {
      const projectExists = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
      });

      if (!projectExists) {
        return NextResponse.json(
          { message: "Projet non trouvé" },
          { status: 404 }
        );
      }
    }

    // Vérifier que le commentaire parent existe si parentCommentId est fourni
    if (validatedData.parentCommentId) {
      const parentExists = await prisma.comment.findUnique({
        where: { id: validatedData.parentCommentId },
      });

      if (!parentExists) {
        return NextResponse.json(
          { message: "Commentaire parent non trouvé" },
          { status: 404 }
        );
      }
    }

    // Préparer les données pour Prisma en excluant les champs undefined
    const createData: any = {
      title: validatedData.title,
      content: validatedData.content,
    };

    // Ajouter seulement les champs non-null/undefined
    if (validatedData.projectId) {
      createData.projectId = validatedData.projectId;
    }

    if (validatedData.parentCommentId) {
      createData.parentCommentId = validatedData.parentCommentId;
    }

    if (validatedData.authorId) {
      createData.authorId = validatedData.authorId;
    }

    const comment = await prisma.comment.create({
      data: createData,
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
                email: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            childComments: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création du commentaire:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du commentaire" },
      { status: 500 }
    );
  }
}
