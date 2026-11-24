import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ApiError } from "@/api/errors";
import { EventRegistrationForm } from "./EventRegistrationForm";

const noop = () => {};

const meta = {
  title: "Events/EventRegistrationForm",
  component: EventRegistrationForm,
  tags: ["autodocs"],
  args: {
    eventStatus: "PUBLISHED",
    remainingSeats: 12,
    defaultName: "Ada Lovelace",
    defaultEmail: "ada@example.com",
    onSubmit: noop,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: 380,
          padding: 24,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventRegistrationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const Error409EventFull: Story = {
  args: {
    serverError: new ApiError({
      status: 409,
      code: "EVENT_FULL",
      title: "Event is full",
      detail: "No remaining seats.",
      requestId: "req_story_409_full",
    }),
  },
};

export const Error409AlreadyRegistered: Story = {
  args: {
    serverError: new ApiError({
      status: 409,
      code: "ALREADY_REGISTERED",
      title: "Already registered",
      detail: "User already registered.",
      requestId: "req_story_409_dup",
    }),
  },
};

export const Error422RegistrationClosed: Story = {
  args: {
    serverError: new ApiError({
      status: 422,
      code: "REGISTRATION_CLOSED",
      title: "Registration closed",
      detail: "Registrations are closed.",
      requestId: "req_story_422_closed",
    }),
  },
};

export const Error422FieldValidation: Story = {
  args: {
    serverError: new ApiError({
      status: 422,
      code: "VALIDATION_FAILED",
      title: "Validation failed",
      detail: "Request validation failed.",
      requestId: "req_story_422_fields",
      errors: [
        {
          field: "email",
          code: "INVALID_FORMAT",
          message: "Cette adresse email n'est pas autorisée.",
        },
      ],
    }),
  },
};

export const Confirmed: Story = {
  args: {
    registration: {
      id: "00000000-0000-4000-8300-000000000099",
      eventId: "00000000-0000-4000-8200-000000000001",
      status: "CONFIRMED",
      position: null,
      createdAt: "2026-11-23T14:30:00.000Z",
    },
  },
};
