import type { EventItem } from "@/api/client";

function formatIcsDateUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildEventIcsContent(event: EventItem): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EventHub//Ynov Lyon//FR",
    "BEGIN:VEVENT",
    `UID:${event.id}@eventhub.ynov`,
    `DTSTAMP:${formatIcsDateUtc(new Date().toISOString())}`,
    `DTSTART:${formatIcsDateUtc(event.startsAt)}`,
    `DTEND:${formatIcsDateUtc(event.endsAt)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.join("\r\n")}\r\n`;
}

export function downloadEventIcs(event: EventItem): void {
  const blob = new Blob([buildEventIcsContent(event)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "event"}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
