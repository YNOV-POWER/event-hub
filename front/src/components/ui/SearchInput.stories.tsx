import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchInput } from "./SearchInput";

const meta = {
  title: "Design System/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Rechercher un événement",
    placeholder: "Rechercher un événement, un lieu...",
  },
};

export const WithValue: Story = {
  args: {
    label: "Rechercher un événement",
    defaultValue: "TypeScript",
    placeholder: "Rechercher un événement, un lieu...",
  },
};

export const WithHint: Story = {
  args: {
    label: "Rechercher un événement",
    defaultValue: "a",
    hint: "Saisissez au moins 2 caractères pour filtrer.",
  },
};
