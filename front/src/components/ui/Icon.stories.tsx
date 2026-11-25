import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon, type IconName } from "./Icon";

const ALL_ICONS: readonly IconName[] = [
  "alert",
  "calendarPlus",
  "check",
  "checkCircle",
  "hourglass",
  "info",
  "xCircle",
];

const meta = {
  title: "Design System/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: { name: "check" },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: { name: "calendarPlus", size: 48 },
};

export const Gallery: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, color: "var(--color-primary)" }}>
      {ALL_ICONS.map((name) => (
        <Icon key={name} name={name} size={24} />
      ))}
    </div>
  ),
};
