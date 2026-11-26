import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ActionList } from "./ActionList";

const noop = () => {};

const meta = {
  title: "Design System/ActionList",
  component: ActionList,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    items: [
      {
        id: "drafts",
        icon: "send",
        tone: "primary",
        title: "2 brouillons à publier",
        subtitle: "Conférence Accessibilité Web, Hackathon",
        href: "/me/events?status=DRAFT",
      },
      {
        id: "almost-full",
        icon: "alert",
        tone: "warning",
        title: "Bientôt complet",
        subtitle: "Conférence Accessibilité : 3 places",
        href: "/events/00000000-0000-4000-8200-000000000002",
      },
      {
        id: "waitlist",
        icon: "users",
        tone: "info",
        title: "4 personnes en attente",
        subtitle: "TypeScript Workshop",
        href: "/admin/events/00000000-0000-4000-8200-000000000001/registrations",
      },
    ],
  },
} satisfies Meta<typeof ActionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OrganizerTodoCard: Story = {};

export const ButtonActions: Story = {
  args: {
    items: [
      {
        id: "export",
        icon: "download",
        tone: "primary",
        title: "Exporter les inscrits en CSV",
        subtitle: "18 participants confirmés",
        onClick: noop,
      },
      {
        id: "duplicate",
        icon: "copy",
        tone: "neutral",
        title: "Dupliquer cet événement",
        subtitle: "Crée une copie en brouillon",
        onClick: noop,
      },
    ],
  },
};

export const AllClearEmptyState: Story = {
  args: {
    items: [],
    emptyItem: {
      icon: "checkCircle",
      tone: "success",
      title: "Tout est à jour",
      subtitle: "Aucune action immédiate sur vos événements.",
    },
  },
};
