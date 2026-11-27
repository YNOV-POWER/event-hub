import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ApiError } from "@/api/errors";
import { DEMO_CANCELLED_EVENT, DEMO_TYPESCRIPT_WORKSHOP } from "@/mocks/organizerDemo";
import { EventFormView } from "./EventFormView";

const noop = () => {};

const meta = {
  title: "Organizer/EventFormView",
  component: EventFormView,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    onSubmit: noop,
    onCancel: noop,
    organizer: { id: "00000000-0000-4000-8100-000000000001", displayName: "Grace" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1248, margin: "0 auto", padding: "32px 24px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventFormView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Edit: Story = {
  args: { event: DEMO_TYPESCRIPT_WORKSHOP },
};

export const Create: Story = {
  args: { event: null },
};

export const Cancelled: Story = {
  args: { event: DEMO_CANCELLED_EVENT },
};

export const Saving: Story = {
  args: { event: DEMO_TYPESCRIPT_WORKSHOP, isSubmitting: true },
};

export const CapacityBelowConfirmed: Story = {
  args: {
    event: DEMO_TYPESCRIPT_WORKSHOP,
    serverError: new ApiError({
      status: 409,
      code: "CAPACITY_BELOW_CONFIRMED",
      title: "Capacity below confirmed",
      detail: "Capacity cannot be lower than confirmed registrations.",
    }),
  },
};
