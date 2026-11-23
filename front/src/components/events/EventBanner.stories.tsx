import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarChip } from "@/components/ui/CalendarChip";
import { EventBanner } from "./EventBanner";

const meta = {
  title: "Events/EventBanner",
  component: EventBanner,
  tags: ["autodocs"],
} satisfies Meta<typeof EventBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkshopCard: Story = {
  args: {
    category: "WORKSHOP",
    status: "PUBLISHED",
    size: "card",
    rightSlot: <CalendarChip month="DÉC" day="10" />,
  },
  decorators: [(Story) => <div style={{ maxWidth: 384 }}><Story /></div>],
};

export const ConcertCard: Story = {
  args: {
    category: "CONCERT",
    status: "PUBLISHED",
    size: "card",
    rightSlot: <CalendarChip month="DÉC" day="12" />,
  },
  decorators: [(Story) => <div style={{ maxWidth: 384 }}><Story /></div>],
};

export const ConferenceHero: Story = {
  args: {
    category: "CONFERENCE",
    status: "PUBLISHED",
    size: "hero",
    showStatusBadge: true,
  },
};

export const CancelledHero: Story = {
  args: {
    category: "CONCERT",
    status: "CANCELLED",
    size: "hero",
    showStatusBadge: true,
  },
};
