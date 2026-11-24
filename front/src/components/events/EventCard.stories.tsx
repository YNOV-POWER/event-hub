import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CANCELLED_EVENT,
  FEW_SEATS_EVENT,
  FULL_EVENT,
  LONG_TITLE_EVENT,
  OPEN_EVENT,
} from "@/mocks/fixtures";
import { EventCard } from "./EventCard";

const meta = {
  title: "Events/EventCard",
  component: EventCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 384 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    event: OPEN_EVENT,
  },
};

export const FewSeats: Story = {
  args: {
    event: FEW_SEATS_EVENT,
  },
};

export const Full: Story = {
  args: {
    event: FULL_EVENT,
  },
};

export const LongTitle: Story = {
  args: {
    event: LONG_TITLE_EVENT,
  },
};

export const Cancelled: Story = {
  args: {
    event: CANCELLED_EVENT,
  },
};
