import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pagination } from "./Pagination";

const noop = () => {};

const meta = {
  title: "Design System/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  args: { onPageChange: noop },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {
  args: { page: 1, totalPages: 7 },
};

export const MiddlePage: Story = {
  args: { page: 4, totalPages: 12 },
};

export const LastPage: Story = {
  args: { page: 7, totalPages: 7 },
};

export const WithSummaryFooter: Story = {
  args: {
    page: 2,
    totalPages: 7,
    summary: "Affichage 1–4 sur 8",
  },
};
