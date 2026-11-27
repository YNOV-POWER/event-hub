import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  cancelRegistrationSuccessHandler,
  myRegistrationsEmptyHandler,
  myRegistrationsErrorHandler,
  myRegistrationsSuccessHandler,
} from "@/mocks/handlers";
import { MyRegistrationsPage } from "./MyRegistrationsPage";

const meta = {
  title: "Pages/MyRegistrationsPage (MSW)",
  component: MyRegistrationsPage,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/me/registrations",
        query: {},
      },
    },
  },
} satisfies Meta<typeof MyRegistrationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  parameters: {
    msw: [myRegistrationsSuccessHandler, cancelRegistrationSuccessHandler],
  },
};

export const Empty: Story = {
  parameters: {
    msw: [myRegistrationsEmptyHandler],
  },
};

export const ServerError500: Story = {
  parameters: {
    msw: [myRegistrationsErrorHandler],
  },
};
