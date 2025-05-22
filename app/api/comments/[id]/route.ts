// app/api/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  projectId: z.string().uuid().nullable().optional(),
  parentCommentId: z.string().uuid().nullable().optional(),
  authorId: z.string().nullable(),
});

// GET /api/comments/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Modifié : Promise
) {
  try {
    const { id } = await params; // ← Ajouté : await

    const comment = await prisma.comment.findUnique({
      where: { id },
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
    });

    if (!comment) {
      return NextResponse.json(
        { message: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Erreur lors de la récupération du commentaire:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération du commentaire" },
      { status: 500 }
    );
  }
}

// PUT /api/comments/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Modifié : Promise
) {
  try {
    const { id } = await params; // ← Ajouté : await
    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    // Vérifier que le commentaire existe
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json(
        { message: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur existe si authorId est fourni
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

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        projectId: validatedData.projectId || undefined,
        parentCommentId: validatedData.parentCommentId || undefined,
        authorId: validatedData.authorId || undefined,
      },
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

    return NextResponse.json(updatedComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la mise à jour du commentaire:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du commentaire" },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Modifié : Promise
) {
  try {
    const { id } = await params; // ← Ajouté : await

    // Vérifier que le commentaire existe
    const existingComment = await prisma.comment.findUnique({
      where: { id }, // ← Maintenant utilise la variable await
      include: {
        _count: {
          select: {
            childComments: true,
          },
        },
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { message: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    // Optionnel : Vérifier s'il y a des commentaires enfants
    if (existingComment._count.childComments > 0) {
      console.log(
        `Suppression du commentaire ${id} avec ${existingComment._count.childComments} réponses`
      );
    }

    // Supprimer le commentaire (les commentaires enfants seront supprimés automatiquement)
    await prisma.comment.delete({
      where: { id }, // ← Maintenant utilise la variable await
    });

    return NextResponse.json({
      message: "Commentaire supprimé avec succès",
      deletedId: id,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du commentaire" },
      { status: 500 }
    );
  }
}
