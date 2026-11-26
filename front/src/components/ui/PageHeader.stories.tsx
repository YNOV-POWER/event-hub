import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { PageHeader } from "./PageHeader";

const meta = {
  title: "Design System/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    title: "Mes événements",
    subtitle: "Créez, publiez et suivez vos événements.",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OrganizerWithPrimaryCta: Story = {
  args: {
    actions: (
      <Button href="/admin/events/new" leftIcon={<Icon name="plus" size={16} />}>
        Créer un événement
      </Button>
    ),
  },
};

export const WithRevalidatingSync: Story = {
  args: {
    title: "Bonjour Grace",
    subtitle: "Voici l'activité de vos événements.",
    isRevalidating: true,
    revalidatingLabel: "Actualisation…",
    actions: (
      <Button href="/admin/events/new" leftIcon={<Icon name="plus" size={16} />}>
        Créer un événement
      </Button>
    ),
  },
};

export const WithStatusBadge: Story = {
  args: {
    title: "Inscrits · TypeScript Workshop",
    subtitle: "10/12/2026 · 19:00 · Hub Central, Lyon",
    badge: (
      <Badge tone="success" dot>
        Publié
      </Badge>
    ),
    actions: (
      <Button href="#export" variant="secondary" leftIcon={<Icon name="download" size={16} />}>
        Exporter en CSV
      </Button>
    ),
  },
};

export const CatalogueWithOverline: Story = {
  args: {
    overline: "Événements à venir",
    title: "Trouvez votre prochain événement",
    subtitle: "4 événements publiés.",
  },
};
