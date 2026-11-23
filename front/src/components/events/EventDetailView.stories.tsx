import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CANCELLED_EVENT, OPEN_EVENT } from "@/mocks/fixtures";
import { EventDetailView } from "./EventDetailView";
import { EventRegistrationForm } from "./EventRegistrationForm";

const noop = () => {};

const meta = {
  title: "Events/EventDetailView",
  component: EventDetailView,
  tags: ["autodocs"],
} satisfies Meta<typeof EventDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenEvent: Story = {
  args: {
    event: OPEN_EVENT,
    registrationSlot: (
      <EventRegistrationForm
        eventStatus={OPEN_EVENT.status}
        remainingSeats={OPEN_EVENT.remainingSeats}
        onSubmit={noop}
      />
    ),
  },
};

export const CancelledEvent: Story = {
  args: {
    event: CANCELLED_EVENT,
    registrationSlot: (
      <EventRegistrationForm
        eventStatus={CANCELLED_EVENT.status}
        remainingSeats={CANCELLED_EVENT.remainingSeats}
        onSubmit={noop}
      />
    ),
  },
};

export const Revalidating: Story = {
  args: {
    event: OPEN_EVENT,
    isRevalidating: true,
    registrationSlot: (
      <EventRegistrationForm
        eventStatus={OPEN_EVENT.status}
        remainingSeats={OPEN_EVENT.remainingSeats}
        onSubmit={noop}
      />
    ),
  },
};
