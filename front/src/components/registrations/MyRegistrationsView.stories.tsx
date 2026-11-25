import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CONFIRMED_REGISTRATION,
  PAST_ATTENDED_REGISTRATION,
  PAST_CANCELLED_REGISTRATION,
  PROMOTED_REGISTRATION,
  WAITLISTED_REGISTRATION,
} from "@/mocks/fixtures";
import { MyRegistrationsView } from "./MyRegistrationsView";

const noop = () => {};

const UPCOMING = [CONFIRMED_REGISTRATION, PROMOTED_REGISTRATION, WAITLISTED_REGISTRATION];
const PAST = [PAST_ATTENDED_REGISTRATION, PAST_CANCELLED_REGISTRATION];

const meta = {
  title: "Registrations/MyRegistrationsView",
  component: MyRegistrationsView,
  tags: ["autodocs"],
  args: {
    upcoming: UPCOMING,
    past: PAST,
    activeTab: "upcoming",
    onTabChange: noop,
    onRetry: noop,
    onDownloadIcs: noop,
    onRequestCancel: noop,
  },
} satisfies Meta<typeof MyRegistrationsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultWithPromotion: Story = {
  args: {
    promotedRegistration: PROMOTED_REGISTRATION,
  },
};

export const PastTab: Story = {
  args: {
    activeTab: "past",
  },
};

export const Loading: Story = {
  args: {
    upcoming: [],
    past: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    upcoming: [],
    past: [],
  },
};

export const ErrorState: Story = {
  args: {
    upcoming: [],
    past: [],
    errorMessage: "Impossible de charger vos inscriptions.",
    errorRequestId: "req_story_reg_500",
  },
};
