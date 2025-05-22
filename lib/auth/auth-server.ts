//@//lib/auth/auth-server.ts

import { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { prisma } from "@/lib/prisma";

export async function getServerSession(request: NextRequest) {
  try {
    // Récupérer le cookie de session avec getSessionCookie
    const sessionCookie = getSessionCookie(request, {});

    if (!sessionCookie || !sessionCookie.valueOf) {
      console.log("[getServerSession] Aucun cookie de session trouvé");
      return null;
    }

    const cookieValue = sessionCookie.valueOf();
    const token =
      typeof cookieValue === "string" && cookieValue.includes(".")
        ? cookieValue.split(".")[0]
        : cookieValue;

    const session = await prisma.session.findUnique({
      where: {
        token: token,
      },
      select: {
        id: true,
        expiresAt: true,
        userId: true,
      },
    });

    console.log(
      "auth/auth-Server : Session trouvée:",
      session
        ? {
            id: session.id,
            expiresAt: session.expiresAt,
            userId: session.userId,
          }
        : "Aucune session"
    );

    if (!session || !session.userId) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      return null;
    }

    return session.userId;
  } catch (error) {
    console.error(
      "[getServerSession] Erreur lors de la récupération de la session:",
      error
    );
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
