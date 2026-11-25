import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarChip } from "./CalendarChip";

const meta = {
  title: "Design System/CalendarChip",
  component: CalendarChip,
  tags: ["autodocs"],
} satisfies Meta<typeof CalendarChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const December: Story = {
  args: { month: "DÉC", day: "10" },
};

export const January: Story = {
  args: { month: "JANV", day: "08" },
};

export const May: Story = {
  args: { month: "MAI", day: "24" },
};

export const SoftUpcoming: Story = {
  args: { month: "DÉC", day: "10", tone: "soft", size: "md" },
};

export const MutedPast: Story = {
  args: { month: "OCT", day: "02", tone: "muted", size: "md" },
};
