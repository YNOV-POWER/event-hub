import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./EmptyState";

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
