import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Modal } from "./Modal";

const noop = () => {};

const meta = {
  title: "Design System/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    onConfirm: noop,
    onClose: noop,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DangerUnsubscribe: Story = {
  args: {
    tone: "danger",
    title: "Se désinscrire de « TypeScript Workshop » ?",
    description: "Votre place sera libérée pour un autre participant.",
    cancelLabel: "Annuler",
    confirmLabel: "Me désinscrire",
  },
};

export const DangerSubmitting: Story = {
  args: {
    tone: "danger",
    title: "Se désinscrire de « TypeScript Workshop » ?",
    description: "Votre place sera libérée pour un autre participant.",
    cancelLabel: "Annuler",
    confirmLabel: "Annulation…",
    isLoading: true,
  },
};

export const DangerWithError: Story = {
  args: {
    tone: "danger",
    title: "Se désinscrire de « TypeScript Workshop » ?",
    description: "Votre place sera libérée pour un autre participant.",
    cancelLabel: "Annuler",
    confirmLabel: "Me désinscrire",
    error: "Une erreur technique inattendue est survenue côté serveur.",
  },
};

export const NeutralInfo: Story = {
  args: {
    tone: "neutral",
    title: "Session expirée",
    description: "Votre session a expiré. Reconnectez-vous pour poursuivre votre action.",
    cancelLabel: "Fermer",
    confirmLabel: "Se connecter",
  },
};
