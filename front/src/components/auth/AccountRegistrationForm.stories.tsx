import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ApiError } from "@/api/errors";
import { AccountRegistrationForm } from "./AccountRegistrationForm";

const noop = () => {};

const meta = {
  title: "Auth/AccountRegistrationForm",
  component: AccountRegistrationForm,
  tags: ["autodocs"],
  args: {
    onSubmit: noop,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: 440,
          padding: 32,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountRegistrationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const Error409EmailAlreadyUsed: Story = {
  args: {
    serverError: new ApiError({
      status: 409,
      code: "EMAIL_ALREADY_USED",
      title: "Email already used",
      detail: "An account with this email already exists.",
      requestId: "req_story_email_used",
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
      requestId: "req_story_val_auth",
      errors: [
        {
          field: "password",
          code: "MIN_LENGTH",
          message: "Le mot de passe doit contenir au moins 12 caractères.",
        },
      ],
    }),
  },
};
