import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const meta = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", children: "S'inscrire" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Réinitialiser les filtres" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Me désinscrire" },
};

export const Loading: Story = {
  args: { variant: "primary", isLoading: true, children: "Inscription en cours…" },
};
