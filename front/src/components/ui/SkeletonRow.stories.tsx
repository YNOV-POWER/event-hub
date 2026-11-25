import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SkeletonRow } from "./SkeletonRow";

const meta = {
  title: "Design System/SkeletonRow",
  component: SkeletonRow,
  tags: ["autodocs"],
} satisfies Meta<typeof SkeletonRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleRow: Story = {
  args: { count: 1, ariaLabel: "Chargement" },
};

export const TwoRows: Story = {
  args: { count: 2, ariaLabel: "Chargement des inscriptions" },
};

export const ThreeRows: Story = {
  args: { count: 3, ariaLabel: "Chargement des inscriptions" },
};
