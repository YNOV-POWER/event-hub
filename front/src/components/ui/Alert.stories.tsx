import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert } from "./Alert";

const meta = {
  title: "Design System/Alert",
  component: Alert,
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    tone: "info",
    title: "Information",
    children: "Connectez-vous pour accéder à vos inscriptions.",
  },
};

export const Success: Story = {
  args: {
    tone: "success",
    title: "Inscription confirmée",
    children: "Votre place pour TypeScript Workshop est réservée.",
  },
};

export const Warning: Story = {
  args: {
    tone: "warning",
    title: "Liste d'attente",
    children: "Vous êtes en position 3 sur la liste d'attente.",
  },
};

export const Danger: Story = {
  args: {
    tone: "danger",
    title: "Cet événement est annulé",
    children: "Les inscriptions ne sont plus ouvertes.",
  },
};
