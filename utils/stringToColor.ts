/**
 * Convertit une chaîne de caractères en une couleur hexadécimale
 * @param str La chaîne à convertir en couleur
 * @returns Une couleur hexadécimale au format "#RRGGBB"
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";
  for (let i = 0; i < 3; i++) {
    // Génère une composante de couleur entre 60 et 200
    // Pour éviter les couleurs trop claires ou trop foncées
    const value = (hash >> (i * 8)) & 0xff;
    const adjustedValue = 60 + (value % 140);
    color += adjustedValue.toString(16).padStart(2, "0");
  }

  return color;
}
