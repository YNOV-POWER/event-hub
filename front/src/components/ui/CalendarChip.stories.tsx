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
