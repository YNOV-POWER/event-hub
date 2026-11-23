import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorState } from "./ErrorState";

const noop = () => {};

const meta = {
  title: "Design System/ErrorState",
  component: ErrorState,
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Technical500: Story = {
  args: {
    variant: "technical",
    title: "Une erreur est survenue",
    description: "Une erreur technique inattendue est survenue côté serveur.",
    requestId: "req_3f2a9c1e5b7d4e8f",
    onRetry: noop,
  },
};

export const NotFound404: Story = {
  args: {
    variant: "notFound",
    overline: "Erreur 404",
    title: "Événement introuvable",
    description: "Cet événement n'existe pas ou n'est plus disponible.",
    homeHref: "/events",
  },
};

export const Forbidden403: Story = {
  args: {
    variant: "forbidden",
    title: "Accès refusé",
    description: "Vous n'avez pas les droits nécessaires pour accéder à cette ressource.",
    homeHref: "/events",
  },
};

export const Unauthorized401: Story = {
  args: {
    variant: "unauthorized",
    title: "Session expirée",
    description: "Veuillez vous reconnecter pour continuer.",
    loginHref: "/login",
  },
};
