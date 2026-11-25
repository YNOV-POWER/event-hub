import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toast } from "./Toast";

const noop = () => {};

const meta = {
  title: "Design System/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    floating: false,
    onClose: noop,
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    tone: "success",
    message: "Vous êtes désinscrit·e de « TypeScript Workshop ».",
  },
};

export const Info: Story = {
  args: {
    tone: "info",
    message: "Export calendrier (.ics) téléchargé.",
  },
};

export const Danger: Story = {
  args: {
    tone: "danger",
    message: "Vous êtes hors ligne. Vérifiez votre connexion.",
  },
};
