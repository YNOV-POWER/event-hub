import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  defaultHandlers,
  myEventsEmptyHandler,
  myEventsErrorHandler,
  myEventsSuccessHandler,
  publishEventConflictHandler,
  publishEventPastDateHandler,
} from "@/mocks/handlers";
import { MyEventsPage } from "./MyEventsPage";

const meta = {
  title: "Pages/MyEventsPage (MSW)",
  component: MyEventsPage,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/me/events",
        query: {},
      },
    },
  },
} satisfies Meta<typeof MyEventsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  parameters: {
    msw: [...defaultHandlers],
  },
};

export const PublishPastDate422: Story = {
  parameters: {
    msw: [myEventsSuccessHandler, publishEventPastDateHandler],
  },
};

export const PublishConflict409: Story = {
  parameters: {
    msw: [myEventsSuccessHandler, publishEventConflictHandler],
  },
};

export const Empty: Story = {
  parameters: {
    msw: [myEventsEmptyHandler],
  },
};

export const ServerError500: Story = {
  parameters: {
    msw: [myEventsErrorHandler],
  },
};
