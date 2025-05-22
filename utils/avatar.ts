"use client";

import { stringToColor } from "@/utils/stringToColor";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Génère les propriétés pour un avatar d'utilisateur
 * @param user L'utilisateur pour lequel générer un avatar
 * @returns Un objet contenant src, fallback et bgColor
 */
export function getUserAvatarProps(user: User) {
  // Source de l'image (si disponible)
  const src = user.image || "";

  // Texte de repli basé sur le nom ou l'email
  let fallback = "";
  if (user.name) {
    // Prend les initiales du nom (jusqu'à 2 caractères)
    fallback = user.name
      .split(" ")
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  } else if (user.email) {
    // Pour l'email, prend la première lettre
    fallback = user.email.charAt(0).toUpperCase();
  }

  // Génère une couleur de fond à partir du nom ou de l'email
  const seed = user.name || user.email || "User";
  const bgColor = stringToColor(seed);

  return { src, fallback, bgColor };
}
