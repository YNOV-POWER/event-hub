import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  myEventsEmptyHandler,
  myEventsErrorHandler,
  myEventsSuccessHandler,
} from "@/mocks/handlers";
import { OrganizerDashboardPage } from "./OrganizerDashboardPage";

const meta = {
  title: "Pages/OrganizerDashboardPage (MSW)",
  component: OrganizerDashboardPage,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard",
        query: {},
      },
    },
  },
} satisfies Meta<typeof OrganizerDashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  parameters: {
    msw: [myEventsSuccessHandler],
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
