import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FEW_SEATS_EVENT, FULL_EVENT, OPEN_EVENT, OTHER_EVENT } from "@/mocks/fixtures";
import { EventGrid } from "./EventGrid";

const meta = {
  title: "Events/EventGrid",
  component: EventGrid,
  tags: ["autodocs"],
} satisfies Meta<typeof EventGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    events: [OPEN_EVENT, FULL_EVENT, FEW_SEATS_EVENT, OTHER_EVENT],
    isLoading: false,
    isStale: false,
  },
};

export const Loading: Story = {
  args: {
    events: [],
    isLoading: true,
    skeletonCount: 6,
  },
};

export const StaleRevalidating: Story = {
  args: {
    events: [OPEN_EVENT, FULL_EVENT, FEW_SEATS_EVENT],
    isLoading: false,
    isStale: true,
  },
};
