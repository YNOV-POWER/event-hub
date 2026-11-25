import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, Icon } from "./Icon";

const meta = {
  title: "Design System/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: { name: "check", size: 20 },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: { name: "calendarPlus", size: 48 },
};

export const MeaningfulWithLabel: Story = {
  args: {
    name: "checkCircle",
    size: 24,
    label: "Inscription confirmée",
  },
};

export const Gallery: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 12,
      }}
    >
      {ICON_NAMES.map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-primary)",
          }}
        >
          <Icon name={name} size={22} />
          <code style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{name}</code>
        </div>
      ))}
    </div>
  ),
};
