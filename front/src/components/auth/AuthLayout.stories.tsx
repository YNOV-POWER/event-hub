import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ApiError } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { AccountRegistrationForm } from "./AccountRegistrationForm";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";

const noop = () => {};

const meta = {
  title: "Auth/AuthLayout",
  component: AuthLayout,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1248, margin: "0 auto", padding: "32px 24px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Register: Story = {
  args: {
    screen: "register",
    title: "Créer un compte",
    subtitle: "Gratuit, en moins d'une minute.",
    children: <AccountRegistrationForm onSubmit={noop} />,
  },
};

export const RegisterEmailAlreadyUsed: Story = {
  args: {
    ...Register.args,
    children: (
      <AccountRegistrationForm
        onSubmit={noop}
        serverError={
          new ApiError({
            status: 409,
            code: "EMAIL_ALREADY_USED",
            title: "Email already used",
            detail: "An account with this email already exists.",
          })
        }
      />
    ),
  },
};

export const Login: Story = {
  args: {
    screen: "login",
    title: "Se connecter",
    subtitle: "Heureux de vous revoir !",
    children: <LoginForm onSubmit={noop} />,
  },
};

export const LoginAccountCreated: Story = {
  args: {
    ...Login.args,
    children: (
      <LoginForm
        onSubmit={noop}
        notice={<Alert tone="success">Compte créé. Vous pouvez vous connecter.</Alert>}
      />
    ),
  },
};
