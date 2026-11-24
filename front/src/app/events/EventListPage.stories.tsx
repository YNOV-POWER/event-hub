import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  emptyEventsHandler,
  errorEventsHandler,
  listSuccessHandler,
} from "@/mocks/handlers";
import { EventListPage } from "./EventListPage";

const meta = {
  title: "Pages/EventListPage (MSW)",
  component: EventListPage,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/events",
        query: {},
      },
    },
  },
} satisfies Meta<typeof EventListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  parameters: {
    msw: [listSuccessHandler],
  },
};

export const Empty: Story = {
  parameters: {
    msw: [emptyEventsHandler],
  },
};

export const ServerError500: Story = {
  parameters: {
    msw: [errorEventsHandler],
  },
};
