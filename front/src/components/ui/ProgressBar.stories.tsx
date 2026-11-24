import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "Design System/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HalfFull: Story = {
  args: { value: 18, max: 30, label: "18 participants inscrits sur 30", tone: "primary" },
};

export const NearlyFull: Story = {
  args: { value: 27, max: 30, label: "27 participants inscrits sur 30", tone: "warning" },
};

export const Full: Story = {
  args: { value: 30, max: 30, label: "Événement complet (30/30)", tone: "danger" },
};

export const Empty: Story = {
  args: { value: 0, max: 50, label: "Aucun inscrit pour l'instant", tone: "success" },
};
