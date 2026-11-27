import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ApiError } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { LoginForm } from "./LoginForm";

const noop = () => {};

const meta = {
  title: "Auth/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
  args: {
    onSubmit: noop,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: 550,
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
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const AccountCreated: Story = {
  args: {
    notice: <Alert tone="success">Compte créé. Vous pouvez vous connecter.</Alert>,
  },
};

export const Redirected: Story = {
  args: {
    notice: <Alert tone="info">Connectez-vous pour accéder à « Mes inscriptions ».</Alert>,
  },
};

export const Error401InvalidCredentials: Story = {
  args: {
    serverError: new ApiError({
      status: 401,
      code: "INVALID_CREDENTIALS",
      title: "Invalid credentials",
      detail: "Email or password is incorrect.",
      requestId: "req_story_invalid_credentials",
    }),
  },
};
