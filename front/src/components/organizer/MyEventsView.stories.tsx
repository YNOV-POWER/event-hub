import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ApiError } from "@/api/errors";
import { MOCK_MY_EVENTS_RESPONSE } from "@/mocks/fixtures";
import { MyEventsView } from "./MyEventsView";

const noop = () => {};

const defaultCounts = {
  ALL: 8,
  DRAFT: 2,
  PUBLISHED: 5,
  CANCELLED: 1,
};

const meta = {
  title: "Organizer/MyEventsView",
  component: MyEventsView,
  tags: ["autodocs"],
  args: {
    events: MOCK_MY_EVENTS_RESPONSE.data,
    meta: { page: 2, pageSize: 4, totalItems: 8, totalPages: 7 },
    activeStatus: "ALL",
    sort: "-startsAt",
    statusCounts: defaultCounts,
    onStatusChange: noop,
    onSortChange: noop,
    onPageChange: noop,
    onResetStatusFilter: noop,
    onRetry: noop,
    onPublish: noop,
    onRequestCancel: noop,
    onDuplicate: noop,
  },
} satisfies Meta<typeof MyEventsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPublishedBanner: Story = {
  args: {
    feedbackBanner: {
      tone: "success",
      message: "« Conférence Accessibilité Web » a été publié.",
    },
  },
};

export const PublishValidationError422: Story = {
  args: {
    feedbackBanner: {
      tone: "danger",
      message: "Impossible de publier : la date de début est passée.",
      editEventId: "00000000-0000-4000-8200-000000000014",
    },
  },
};

export const PublishStateConflict409: Story = {
  args: {
    feedbackBanner: {
      tone: "warning",
      message: "Cet événement a déjà été publié ou annulé.",
    },
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
    meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
  },
};

export const ServerError: Story = {
  args: {
    events: [],
    error: new ApiError({
      status: 500,
      code: "INTERNAL_ERROR",
      title: "Internal error",
      detail: "Unexpected database failure",
      requestId: "req_story_my_events_500",
    }),
  },
};
