import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CapacityMeter } from "./CapacityMeter";

const meta = {
  title: "Design System/CapacityMeter",
  component: CapacityMeter,
  tags: ["autodocs"],
  args: {
    value: 18,
    max: 30,
    label: "Remplissage de TypeScript Workshop : 60 %",
  },
} satisfies Meta<typeof CapacityMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompactTableCell: Story = {
  args: {
    size: "sm",
    showPercent: false,
  },
};

export const WithPercentage: Story = {
  args: {
    size: "md",
    showPercent: true,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
};

export const NearCapacityWarning: Story = {
  args: {
    value: 27,
    max: 30,
    size: "md",
    showPercent: true,
    warningThresholdPercent: 85,
    label: "Remplissage de Conférence Accessibilité Web : 90 %",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
};

export const EmptyZeroRegistrations: Story = {
  args: {
    value: 0,
    max: 20,
    size: "sm",
    label: "Remplissage : 0 sur 20",
  },
};
