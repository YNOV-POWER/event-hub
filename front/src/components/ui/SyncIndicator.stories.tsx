import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SyncIndicator } from "./SyncIndicator";

const meta = {
  title: "Design System/SyncIndicator",
  component: SyncIndicator,
  tags: ["autodocs"],
} satisfies Meta<typeof SyncIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CatalogueUpdate: Story = {
  args: { label: "Mise à jour des données en cours…" },
};

export const SeatsUpdate: Story = {
  args: { label: "Actualisation des places…" },
};

export const Compact: Story = {
  args: { label: "Synchronisation…" },
};
