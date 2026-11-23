import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Select } from "./Select";

const SORT_OPTIONS = [
  { value: "startsAt", label: "Date (plus proche)" },
  { value: "-startsAt", label: "Date (plus lointaine)" },
  { value: "title", label: "Titre (A → Z)" },
];

const meta = {
  title: "Design System/Select",
  component: Select,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Trier par",
    options: SORT_OPTIONS,
    defaultValue: "startsAt",
  },
};

export const SelectedValue: Story = {
  args: {
    label: "Trier par",
    options: SORT_OPTIONS,
    defaultValue: "title",
  },
};

export const WithError: Story = {
  args: {
    label: "Catégorie",
    options: [
      { value: "", label: "Choisir une catégorie" },
      { value: "WORKSHOP", label: "Atelier" },
      { value: "CONFERENCE", label: "Conférence" },
    ],
    error: "La catégorie est obligatoire.",
  },
};
