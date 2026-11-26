import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Navbar } from "./Navbar";

const noop = () => {};

const meta = {
  title: "Design System/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visitor: Story = {
  args: {
    currentPath: "/events",
    user: null,
  },
};

export const Participant: Story = {
  args: {
    currentPath: "/events",
    user: { displayName: "Ada", role: "PARTICIPANT" },
    onSignOut: noop,
  },
};

export const Organizer: Story = {
  args: {
    currentPath: "/me/events",
    user: { displayName: "Grace", role: "ORGANIZER" },
    onSignOut: noop,
  },
};

export const OrganizerDashboard: Story = {
  args: {
    currentPath: "/dashboard",
    user: { displayName: "Grace", role: "ORGANIZER" },
    onSignOut: noop,
  },
};
