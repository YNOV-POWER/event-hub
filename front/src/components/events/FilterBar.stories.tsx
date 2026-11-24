import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DEFAULT_FILTERS } from "@/hooks/useEventFilters";
import { FilterBar } from "./FilterBar";

const noop = () => {};

const meta = {
  title: "Events/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  args: {
    onSearchChange: noop,
    onToggleCategory: noop,
    onDatePresetChange: noop,
    onSortChange: noop,
    onReset: noop,
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    filters: DEFAULT_FILTERS,
    totalItems: 134,
    totalPages: 15,
    isFiltered: false,
    isRevalidating: false,
  },
};

export const WithActiveFilters: Story = {
  args: {
    filters: {
      ...DEFAULT_FILTERS,
      q: "TypeScript",
      categories: ["WORKSHOP", "CONCERT"],
      sort: "-startsAt",
      page: 2,
    },
    totalItems: 12,
    totalPages: 2,
    isFiltered: true,
    isRevalidating: false,
  },
};

export const Revalidating: Story = {
  args: {
    filters: {
      ...DEFAULT_FILTERS,
      categories: ["CONFERENCE"],
    },
    totalItems: 8,
    totalPages: 1,
    isFiltered: true,
    isRevalidating: true,
  },
};
