import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StrengthMeter } from "./StrengthMeter";

const meta = {
  title: "Design System/StrengthMeter",
  component: StrengthMeter,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StrengthMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { level: 0 },
};

export const Weak: Story = {
  args: { level: 2 },
};

export const Good: Story = {
  args: { level: 3 },
};

export const Strong: Story = {
  args: { level: 4 },
};
