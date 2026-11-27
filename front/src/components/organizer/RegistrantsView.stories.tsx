import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  DEMO_EMPTY_EVENT,
  DEMO_REGISTRANTS,
  DEMO_TYPESCRIPT_WORKSHOP,
} from "@/mocks/organizerDemo";
import { RegistrantsView } from "./RegistrantsView";

const noop = () => {};

const meta = {
  title: "Organizer/RegistrantsView",
  component: RegistrantsView,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    event: DEMO_TYPESCRIPT_WORKSHOP,
    registrants: DEMO_REGISTRANTS,
    page: 1,
    pageSize: 6,
    onPageChange: noop,
    onExport: noop,
    onCopyLink: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1248, margin: "0 auto", padding: "32px 24px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RegistrantsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { event: DEMO_EMPTY_EVENT, registrants: [] },
};

export const Forbidden: Story = {
  args: { isForbidden: true, registrants: [] },
};

export const Loading: Story = {
  args: { isLoading: true },
};
