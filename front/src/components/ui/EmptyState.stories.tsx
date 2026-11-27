import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";

const noop = () => {};

const meta = {
  title: "Design System/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilteredEmpty: Story = {
  args: {
    title: "Aucun événement",
    description: "Aucun événement ne correspond à vos critères actuels.",
    actionLabel: "Réinitialiser les filtres",
    onAction: noop,
  },
};

export const NoAction: Story = {
  args: {
    title: "Aucun événement publié",
    description: "Revenez bientôt pour découvrir les prochains rendez-vous Ynov.",
  },
};

export const NoRegistrations: Story = {
  args: {
    title: "Aucune inscription",
    description: "Vous n'êtes encore inscrit·e à aucun événement.",
    actionLabel: "Voir les événements",
    actionHref: "/events",
  },
};

export const OrganizerNoEvents: Story = {
  args: {
    icon: <Icon name="calendarPlus" size={28} />,
    title: "Aucun événement",
    description: "Créez votre premier événement : il sera enregistré en brouillon.",
    actionLabel: "Créer un événement",
    actionIcon: <Icon name="plus" size={16} />,
    actionHref: "/admin/events/new",
  },
};
