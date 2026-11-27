"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { EventCategory, EventItem, EventStatus, OrganizerSummary } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { EventCard } from "@/components/events/EventCard";
import { Alert, type AlertTone } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { EventFormValues } from "@/hooks/useSaveEvent";
import styles from "./EventFormView.module.css";

const CATEGORIES = ["WORKSHOP", "CONFERENCE", "CONCERT", "OTHER"] as const satisfies readonly EventCategory[];
const DESCRIPTION_MAX = 5000;
const INTEGER_PATTERN = /^\d+$/;

const STATUS_TONES: Record<EventStatus, BadgeTone> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  CANCELLED: "danger",
};

interface EventFormFields {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
}

const FIELD_NAMES = new Set<keyof EventFormFields>([
  "title",
  "description",
  "category",
  "location",
  "startsAt",
  "endsAt",
  "capacity",
]);

export interface EventFormViewProps {
  readonly event?: EventItem | null;
  readonly organizer?: OrganizerSummary | null;
  readonly isSubmitting?: boolean;
  readonly serverError?: ApiError | null;
  readonly onSubmit: (values: EventFormValues) => void;
  readonly onCancel: () => void;
}

function toLocalInputValue(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function isInFuture(iso: string): boolean {
  return new Date(iso).getTime() > Date.now();
}

function toIsoString(localValue: string | undefined): string | null {
  if (!localValue) return null;
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function EventFormView({
  event = null,
  organizer = null,
  isSubmitting = false,
  serverError = null,
  onSubmit,
  onCancel,
}: EventFormViewProps) {
  const { t } = useTranslation();
  const isEdit = event !== null;
  const isCancelled = event?.status === "CANCELLED";
  const confirmedCount = event?.confirmedCount ?? 0;
  const [fallbackDate] = useState(() => new Date().toISOString());
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const schema = useMemo(
    () =>
      z
        .object({
          title: z
            .string()
            .trim()
            .min(3, t("eventForm.validation.titleLength"))
            .max(120, t("eventForm.validation.titleLength")),
          description: z.string().max(DESCRIPTION_MAX, t("eventForm.validation.descriptionMax")),
          category: z.enum(CATEGORIES),
          location: z
            .string()
            .trim()
            .min(1, t("eventForm.validation.locationRequired"))
            .max(200, t("eventForm.validation.locationMax")),
          startsAt: z.string().min(1, t("eventForm.validation.startsAtRequired")),
          endsAt: z.string().min(1, t("eventForm.validation.endsAtRequired")),
          capacity: z.string().trim().regex(INTEGER_PATTERN, t("eventForm.validation.capacityInteger")),
        })
        .superRefine((values, ctx) => {
          const startsAt = toIsoString(values.startsAt);
          const endsAt = toIsoString(values.endsAt);
          if (values.startsAt && !startsAt) {
            ctx.addIssue({ code: "custom", path: ["startsAt"], message: t("eventForm.validation.dateInvalid") });
          }
          if (values.endsAt && !endsAt) {
            ctx.addIssue({ code: "custom", path: ["endsAt"], message: t("eventForm.validation.dateInvalid") });
          }
          if (!isEdit && startsAt && !isInFuture(startsAt)) {
            ctx.addIssue({
              code: "custom",
              path: ["startsAt"],
              message: t("eventForm.validation.startsAtFuture"),
            });
          }
          if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
            ctx.addIssue({
              code: "custom",
              path: ["endsAt"],
              message: t("eventForm.validation.endsAfterStart"),
            });
          }
          if (INTEGER_PATTERN.test(values.capacity.trim())) {
            const capacity = Number(values.capacity);
            if (capacity < 1) {
              ctx.addIssue({ code: "custom", path: ["capacity"], message: t("eventForm.validation.capacityMin") });
            } else if (capacity < confirmedCount) {
              ctx.addIssue({
                code: "custom",
                path: ["capacity"],
                message: t("eventForm.validation.capacityBelowConfirmed", { count: confirmedCount }),
              });
            }
          }
        }),
    [t, isEdit, confirmedCount],
  );

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<EventFormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      category: event?.category ?? "WORKSHOP",
      location: event?.location ?? "",
      startsAt: toLocalInputValue(event?.startsAt),
      endsAt: toLocalInputValue(event?.endsAt),
      capacity: event ? String(event.capacity) : "",
    },
  });

  const values = useWatch({ control });

  useEffect(() => {
    if (!serverError) return;
    if (serverError.code === "CAPACITY_BELOW_CONFIRMED") {
      setError("capacity", {
        type: "server",
        message: t("eventForm.validation.capacityBelowConfirmed", { count: confirmedCount }),
      });
      return;
    }
    if (serverError.status === 422) {
      for (const fieldError of serverError.errors) {
        if (FIELD_NAMES.has(fieldError.field as keyof EventFormFields)) {
          setError(fieldError.field as keyof EventFormFields, {
            type: "server",
            message: fieldError.message,
          });
        }
      }
    }
  }, [serverError, setError, t, confirmedCount]);

  const capacityText = (values.capacity ?? "").trim();
  const capacityValue = INTEGER_PATTERN.test(capacityText) ? Number(capacityText) : null;
  const isCapacityBelowConfirmed =
    isEdit && Boolean(errors.capacity) && capacityValue !== null && capacityValue >= 1 && capacityValue < confirmedCount;

  let banner: { tone: AlertTone; message: string } | null = null;
  if (isCancelled || serverError?.code === "EVENT_NOT_EDITABLE") {
    banner = { tone: "warning", message: t("eventForm.notEditable") };
  } else if (serverError?.code === "CAPACITY_BELOW_CONFIRMED" || isCapacityBelowConfirmed) {
    banner = {
      tone: "danger",
      message: t("eventForm.capacityBelowConfirmedAlert", { count: confirmedCount }),
    };
  } else if (serverError) {
    banner = {
      tone: "danger",
      message: t(`errors.codes.${serverError.code}`, { defaultValue: t("errors.genericDescription") }),
    };
  }

  const categoryOptions = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        value: category,
        label: t("eventForm.categoryOption", { label: t(`categories.${category}`), value: category }),
      })),
    [t],
  );

  const previewCapacity = (errors.capacity ? event?.capacity : capacityValue) ?? 0;
  const previewTitle = errors.title ? event?.title : values.title?.trim();
  const previewLocation = errors.location ? event?.location : values.location?.trim();
  const previewStartsAt = errors.startsAt ? event?.startsAt : toIsoString(values.startsAt);
  const previewEndsAt = errors.endsAt ? event?.endsAt : toIsoString(values.endsAt);
  const previewEvent: EventItem = {
    id: event?.id ?? "preview",
    title: previewTitle || t("eventForm.titlePlaceholder"),
    description: values.description ?? "",
    category: values.category ?? "WORKSHOP",
    location: previewLocation || t("eventForm.locationPlaceholder"),
    startsAt: previewStartsAt ?? event?.startsAt ?? fallbackDate,
    endsAt: previewEndsAt ?? event?.endsAt ?? fallbackDate,
    capacity: previewCapacity,
    confirmedCount,
    remainingSeats: Math.max(previewCapacity - confirmedCount, 0),
    waitlistCount: event?.waitlistCount ?? 0,
    status: event?.status ?? "DRAFT",
    organizer: event?.organizer ?? organizer ?? { id: "", displayName: "" },
    createdAt: event?.createdAt ?? fallbackDate,
    updatedAt: event?.updatedAt ?? fallbackDate,
  };

  const status = event?.status ?? "DRAFT";

  const submit = handleSubmit((fields) => {
    const startsAt = toIsoString(fields.startsAt);
    const endsAt = toIsoString(fields.endsAt);
    if (!startsAt || !endsAt) return;
    onSubmit({
      title: fields.title.trim(),
      description: fields.description,
      category: fields.category,
      location: fields.location.trim(),
      startsAt,
      endsAt,
      capacity: Number(fields.capacity),
    });
  });

  return (
    <div className={styles.page}>
      <Link href="/me/events" className={styles.backLink}>
        <Icon name="chevronLeft" size={16} />
        <span>{t("eventForm.backToMyEvents")}</span>
      </Link>

      <PageHeader
        title={isEdit ? t("eventForm.editTitle") : t("eventForm.createTitle")}
        badge={
          <Badge tone={STATUS_TONES[status]} dot>
            {t(`statuses.${status}`)}
          </Badge>
        }
      />

      {banner ? <Alert tone={banner.tone}>{banner.message}</Alert> : null}

      <div className={styles.layout}>
        <form noValidate className={styles.card} onSubmit={submit}>
          <h2 className={styles.sectionTitle}>{t("eventForm.sectionInformation")}</h2>

          <Input
            label={t("eventForm.titleLabel")}
            placeholder={t("eventForm.titlePlaceholder")}
            hint={t("eventForm.titleHint")}
            disabled={isCancelled}
            error={errors.title?.message}
            {...register("title")}
          />

          <Textarea
            label={t("eventForm.descriptionLabel")}
            hint={t("eventForm.descriptionHint", { length: values.description?.length ?? 0 })}
            maxLength={DESCRIPTION_MAX}
            disabled={isCancelled}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className={styles.twoCols}>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  label={t("eventForm.categoryLabel")}
                  options={categoryOptions}
                  name={field.name}
                  value={field.value}
                  disabled={isCancelled}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Input
              label={t("eventForm.locationLabel")}
              placeholder={t("eventForm.locationPlaceholder")}
              disabled={isCancelled}
              error={errors.location?.message}
              {...register("location")}
            />
          </div>

          <hr className={styles.divider} />

          <h2 className={styles.sectionTitle}>{t("eventForm.sectionSchedule")}</h2>

          <div className={styles.twoCols}>
            <Input
              type="datetime-local"
              label={t("eventForm.startsAtLabel")}
              hint={t("eventForm.startsAtHint", { timeZone })}
              disabled={isCancelled}
              error={errors.startsAt?.message}
              {...register("startsAt")}
            />
            <Input
              type="datetime-local"
              label={t("eventForm.endsAtLabel")}
              disabled={isCancelled}
              error={errors.endsAt?.message}
              {...register("endsAt")}
            />
          </div>

          <div className={`${styles.twoCols} ${styles.capacityRow}`}>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              label={t("eventForm.capacityLabel")}
              className={styles.capacity}
              disabled={isCancelled}
              error={errors.capacity?.message}
              {...register("capacity")}
            />
          </div>

          <hr className={styles.divider} />

          <div className={styles.actions}>
            <Button variant="secondary" disabled={isSubmitting} onClick={onCancel}>
              {t("eventForm.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || isCancelled}
              aria-busy={isSubmitting || undefined}
              leftIcon={isEdit && !isSubmitting ? <Icon name="check" size={18} /> : undefined}
            >
              {isSubmitting
                ? t("eventForm.saving")
                : isEdit
                  ? t("eventForm.save")
                  : t("eventForm.saveDraft")}
            </Button>
          </div>
        </form>

        <aside className={styles.aside} aria-labelledby="event-form-preview-title">
          <h2 id="event-form-preview-title" className={styles.asideTitle}>
            {t("eventForm.previewTitle")}
          </h2>
          <div inert className={styles.preview}>
            <EventCard event={previewEvent} />
          </div>
          <section className={styles.tips} aria-labelledby="event-form-tips-title">
            <h3 id="event-form-tips-title" className={styles.tipsTitle}>
              <Icon name="info" size={18} className={styles.tipsIcon} />
              <span>{t("eventForm.tipsTitle")}</span>
            </h3>
            <ul className={styles.tipsList}>
              <li>{t("eventForm.tips.draft")}</li>
              <li>{t("eventForm.tips.notify")}</li>
              <li>{t("eventForm.tips.cancelled")}</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
