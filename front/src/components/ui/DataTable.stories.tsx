import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { CapacityMeter } from "./CapacityMeter";
import { DataTable, type DataTableColumn } from "./DataTable";

interface SampleEventRow {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  readonly confirmed: number;
  readonly capacity: number;
}

const sampleEvents: readonly SampleEventRow[] = [
  {
    id: "1",
    title: "Conférence Accessibilité Web",
    date: "15/12/2026 · 09:00",
    status: "DRAFT",
    confirmed: 0,
    capacity: 50,
  },
  {
    id: "2",
    title: "TypeScript Workshop",
    date: "10/12/2026 · 19:00",
    status: "PUBLISHED",
    confirmed: 18,
    capacity: 30,
  },
  {
    id: "3",
    title: "Atelier Figma",
    date: "14/09/2026 · 14:00",
    status: "CANCELLED",
    confirmed: 0,
    capacity: 20,
  },
];

const eventColumns: readonly DataTableColumn<SampleEventRow>[] = [
  {
    key: "title",
    header: "Titre",
    render: (row) => <strong>{row.title}</strong>,
  },
  {
    key: "date",
    header: "Date",
    render: (row) => row.date,
  },
  {
    key: "status",
    header: "Statut",
    render: (row) => {
      if (row.status === "PUBLISHED") {
        return (
          <Badge tone="success" dot>
            Publié
          </Badge>
        );
      }
      if (row.status === "CANCELLED") {
        return (
          <Badge tone="danger" dot>
            Annulé
          </Badge>
        );
      }
      return (
        <Badge tone="neutral" dot>
          Brouillon
        </Badge>
      );
    },
  },
  {
    key: "fill",
    header: "Inscrits",
    render: (row) =>
      row.status === "DRAFT" ? (
        "—"
      ) : (
        <CapacityMeter
          value={row.confirmed}
          max={row.capacity}
          size="sm"
          label={`Remplissage de ${row.title}`}
        />
      ),
  },
];

const meta = {
  title: "Design System/DataTable",
  component: DataTable<SampleEventRow>,
  tags: ["autodocs"],
  args: {
    columns: eventColumns,
    data: sampleEvents,
    getRowKey: (row) => row.id,
  },
} satisfies Meta<typeof DataTable<SampleEventRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EventsTable: Story = {};

export const ParticipantsPreview: Story = {
  render: () => {
    interface ParticipantRow {
      readonly id: string;
      readonly name: string;
      readonly email: string;
      readonly registeredAt: string;
    }
    const rows: readonly ParticipantRow[] = [
      {
        id: "p1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        registeredAt: "20/11/2026 10:12",
      },
      {
        id: "p2",
        name: "Alan Turing",
        email: "alan@example.com",
        registeredAt: "20/11/2026 11:40",
      },
    ];
    const cols: readonly DataTableColumn<ParticipantRow>[] = [
      {
        key: "name",
        header: "Participant",
        render: (row) => (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <Avatar name={row.name} size="sm" />
            <strong>{row.name}</strong>
          </div>
        ),
      },
      { key: "email", header: "Email", render: (row) => row.email },
      {
        key: "status",
        header: "Statut",
        render: () => (
          <Badge tone="success" dot>
            Confirmé
          </Badge>
        ),
      },
      { key: "date", header: "Inscrit le", render: (row) => row.registeredAt },
    ];
    return <DataTable columns={cols} data={rows} getRowKey={(row) => row.id} />;
  },
};

export const WithEmptySlot: Story = {
  args: {
    data: [],
    emptyState: <p style={{ margin: 0 }}>Aucun événement publié à venir pour le moment.</p>,
  },
};
