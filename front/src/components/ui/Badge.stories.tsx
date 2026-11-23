import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta = {
  title: "Design System/Badge",
  component: Badge,
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AvailableSeats: Story = {
  args: { tone: "success", dot: true, children: "12 places" },
};

export const FewSeats: Story = {
  args: { tone: "warning", dot: true, children: "3 places" },
};

export const Full: Story = {
  args: { tone: "danger", dot: true, children: "Complet" },
};

export const CategoryPill: Story = {
  args: { tone: "frosted", dot: true, dotColor: "#4F46E5", children: "Atelier" },
};
