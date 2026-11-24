import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./Avatar";

const meta = {
  title: "Design System/Avatar",
  component: Avatar,
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { name: "Grace Hopper", size: "sm" },
};

export const Medium: Story = {
  args: { name: "Ada Lovelace", size: "md" },
};

export const Large: Story = {
  args: { name: "Alan Turing", size: "lg" },
};
