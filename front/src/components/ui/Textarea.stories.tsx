import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Design System/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    label: "Description",
    hint: "160 / 5000 caractères · texte brut, aucun HTML interprété",
    defaultValue:
      "Hands-on session : configuration du compilateur, types utilitaires, génériques et narrowing.",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: "5000 caractères maximum." },
};

export const Disabled: Story = {
  args: { disabled: true },
};
