import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CONFIRMED_REGISTRATION,
  PAST_ATTENDED_REGISTRATION,
  PAST_CANCELLED_REGISTRATION,
  WAITLISTED_REGISTRATION,
} from "@/mocks/fixtures";
import { RegistrationRow } from "./RegistrationRow";

const noop = () => {};

const meta = {
  title: "Registrations/RegistrationRow",
  component: RegistrationRow,
  tags: ["autodocs"],
  args: {
    onDownloadIcs: noop,
    onRequestCancel: noop,
  },
} satisfies Meta<typeof RegistrationRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmedUpcoming: Story = {
  args: {
    registration: CONFIRMED_REGISTRATION,
    isPast: false,
  },
};

export const WaitlistedUpcoming: Story = {
  args: {
    registration: WAITLISTED_REGISTRATION,
    isPast: false,
  },
};

export const PastAttended: Story = {
  args: {
    registration: PAST_ATTENDED_REGISTRATION,
    isPast: true,
  },
};

export const PastCancelled: Story = {
  args: {
    registration: PAST_CANCELLED_REGISTRATION,
    isPast: true,
  },
};
