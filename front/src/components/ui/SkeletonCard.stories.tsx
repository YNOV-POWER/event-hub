import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SkeletonCard } from "./SkeletonCard";

const meta = {
  title: "Design System/SkeletonCard",
  component: SkeletonCard,
  tags: ["autodocs"],
} satisfies Meta<typeof SkeletonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 384 }}>
        <Story />
      </div>
    ),
  ],
};

export const Compact: Story = {
  args: { compact: true },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 340 }}>
        <Story />
      </div>
    ),
  ],
};

export const GridOfThree: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  ),
};
