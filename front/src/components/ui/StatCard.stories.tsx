import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatCard } from "./StatCard";

const meta = {
  title: "Design System/StatCard",
  component: StatCard,
  tags: ["autodocs"],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UpcomingEvents: Story = {
  args: {
    icon: "calendar",
    iconTone: "primary",
    value: 5,
    label: "Événements à venir",
    caption: "+2 ce mois-ci",
    captionTone: "success",
  },
};

export const DraftsToPublish: Story = {
  args: {
    icon: "pencil",
    iconTone: "warning",
    value: 2,
    label: "Brouillons",
    caption: "À publier",
    captionTone: "success",
  },
};

export const AverageFillRate: Story = {
  args: {
    icon: "trendingUp",
    iconTone: "success",
    value: "74 %",
    label: "Taux de remplissage moyen",
    caption: "+6 pts vs mois dernier",
    captionTone: "success",
  },
};

export const DashboardGrid: Story = {
  args: {
    icon: "calendar",
    value: 5,
    label: "Événements à venir",
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
      }}
    >
      <StatCard
        icon="calendar"
        iconTone="primary"
        value={5}
        label="Événements à venir"
        caption="+2 ce mois-ci"
      />
      <StatCard
        icon="pencil"
        iconTone="warning"
        value={2}
        label="Brouillons"
        caption="À publier"
      />
      <StatCard
        icon="trendingUp"
        iconTone="success"
        value="74 %"
        label="Taux de remplissage moyen"
        caption="+6 pts vs mois dernier"
      />
      <StatCard
        icon="hourglass"
        iconTone="info"
        value={9}
        label="En liste d'attente"
        caption="Sur 3 événements"
      />
    </div>
  ),
};
