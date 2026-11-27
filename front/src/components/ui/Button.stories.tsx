import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";
import { Icon } from "./Icon";

const meta = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", children: "S'inscrire" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Réinitialiser les filtres" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Me désinscrire" },
};

export const LinkVariant: Story = {
  args: { variant: "link", children: "Réinitialiser les filtres" },
};

export const Loading: Story = {
  args: { variant: "primary", isLoading: true, children: "Inscription en cours…" },
};

export const AsNavigationLink: Story = {
  args: {
    href: "/admin/events/new",
    variant: "primary",
    leftIcon: <Icon name="plus" size={16} />,
    children: "Créer un événement",
  },
};

export const AsSecondarySmallLink: Story = {
  args: {
    href: "/admin/events/00000000-0000-4000-8200-000000000001/edit",
    variant: "secondary",
    size: "sm",
    leftIcon: <Icon name="pencil" size={14} />,
    children: "Modifier",
  },
};
