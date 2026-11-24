import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Chip } from "./Chip";

const meta = {
  title: "Design System/Chip",
  component: Chip,
  tags: ["autodocs"],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Atelier", active: false },
};

export const Active: Story = {
  args: { children: "Toutes", active: true, count: 134 },
};

export const WithCount: Story = {
  args: { children: "Conférence", active: false, count: 31 },
};
