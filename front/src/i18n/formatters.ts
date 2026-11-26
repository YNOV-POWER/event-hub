const LOCALE = "fr-FR";

/**
 * Formate une plage ISO 8601 UTC pour la carte catalogue :
 * ex. "Mer. 10 déc. · 18:00 – 21:00"
 */
export function formatEventCardDateRange(startsAtIso: string, endsAtIso: string): string {
  const start = new Date(startsAtIso);
  const end = new Date(endsAtIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return startsAtIso;
  }

  const dayPart = new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(start);

  const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const capitalizedDay = dayPart.charAt(0).toUpperCase() + dayPart.slice(1);
  return `${capitalizedDay} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

/**
 * Formate la date complète pour l'écran détail :
 * ex. { date: "Mercredi 10 décembre 2026", timeRange: "18:00 – 21:00" }
 */
export function formatEventDetailDate(
  startsAtIso: string,
  endsAtIso: string,
): { date: string; timeRange: string } {
  const start = new Date(startsAtIso);
  const end = new Date(endsAtIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { date: startsAtIso, timeRange: "" };
  }

  const fullDate = new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);

  const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    date: fullDate.charAt(0).toUpperCase() + fullDate.slice(1),
    timeRange: `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`,
  };
}

/**
 * Extrait le mois court (ex. "DÉC") et le jour ("10") pour le badge calendrier Figma.
 */
export function formatCalendarChip(startsAtIso: string): { month: string; day: string } {
  const date = new Date(startsAtIso);
  if (Number.isNaN(date.getTime())) {
    return { month: "---", day: "--" };
  }
  const month = new Intl.DateTimeFormat(LOCALE, { month: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
  const day = new Intl.DateTimeFormat(LOCALE, { day: "2-digit" }).format(date);
  return { month, day };
}

/**
 * Formate une position en ordinal français : 1 -> "1ʳᵉ", 2 -> "2ᵉ", 3 -> "3ᵉ".
 */
export function formatOrdinalFr(position: number): string {
  return position === 1 ? "1ʳᵉ" : `${position}ᵉ`;
}

/**
 * Formate une date ISO 8601 UTC pour les tableaux organisateur (écran 07) :
 * ex. "15/12/2026 · 09:00"
 */
export function formatOrganizerEventDate(startsAtIso: string): string {
  const date = new Date(startsAtIso);
  if (Number.isNaN(date.getTime())) {
    return startsAtIso;
  }
  const datePart = new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${datePart} · ${timePart}`;
}

/**
 * Formate une date courte pour le tableau de bord organisateur (écran 10) :
 * ex. "10/12 · 19:00"
 */
export function formatShortEventDate(startsAtIso: string): string {
  const date = new Date(startsAtIso);
  if (Number.isNaN(date.getTime())) {
    return startsAtIso;
  }
  const datePart = new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
  const timePart = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${datePart} · ${timePart}`;
}

/**
 * Retourne 1 à 2 initiales pour un nom d'organisateur ou d'utilisateur.
 */
export function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  const second = parts[1];
  if (second) {
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  }
  return first.slice(0, 2).toUpperCase();
}
