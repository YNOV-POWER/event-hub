import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ApiError } from "@/api/errors";
import { MOCK_ORGANIZER_EVENTS, PUBLISHED_ORGANIZER_EVENT } from "@/mocks/fixtures";
import { OrganizerDashboardView } from "./OrganizerDashboardView";

const meta = {
  title: "Organizer/OrganizerDashboardView",
  component: OrganizerDashboardView,
  tags: ["autodocs"],
  args: {
    organizerName: "Grace",
    events: MOCK_ORGANIZER_EVENTS,
    referenceDate: new Date("2026-12-01T10:00:00.000Z"),
  },
} satisfies Meta<typeof OrganizerDashboardView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllClearNoPendingActions: Story = {
  args: {
    events: [
      {
        ...PUBLISHED_ORGANIZER_EVENT,
        confirmedCount: 12,
        remainingSeats: 18,
        waitlistCount: 0,
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    events: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
};

export const ServerError: Story = {
  args: {
    events: [],
    error: new ApiError({
      status: 500,
      code: "INTERNAL_ERROR",
      title: "Internal server error",
      detail: "Failed to load dashboard metrics.",
      requestId: "req_story_dashboard_500",
    }),
  },
};
