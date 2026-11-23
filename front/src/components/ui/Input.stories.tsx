import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./Input";

const meta = {
  title: "Design System/Input",
  component: Input,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Adresse email",
    placeholder: "ada@example.com",
    type: "email",
  },
};

export const WithHint: Story = {
  args: {
    label: "Nom affiché",
    defaultValue: "Ada",
    hint: "2 à 80 caractères",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    defaultValue: "ada@example.com",
    error: "Un compte existe déjà avec cette adresse email.",
  },
};
