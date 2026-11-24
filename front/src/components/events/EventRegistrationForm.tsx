"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ticket } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { CreateRegistrationDto, EventStatus, Registration } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./EventRegistrationForm.module.css";

const KNOWN_FIELDS = new Set<keyof CreateRegistrationDto>([
  "participantName",
  "email",
  "notes",
]);

export interface EventRegistrationFormProps {
  readonly eventStatus: EventStatus;
  readonly remainingSeats: number;
  readonly defaultName?: string;
  readonly defaultEmail?: string;
  readonly isSubmitting?: boolean;
  readonly serverError?: ApiError | null;
  readonly registration?: Registration | null;
  readonly onSubmit: (dto: CreateRegistrationDto) => void;
}

/**
 * Formulaire d'inscription à un événement (Atelier 6, étape 5 · US11).
 * Validation client Zod + rattachement des erreurs 422 par champ + messages métier 409 / 422.
 */
export function EventRegistrationForm({
  eventStatus,
  remainingSeats,
  defaultName = "",
  defaultEmail = "",
  isSubmitting = false,
  serverError = null,
  registration = null,
  onSubmit,
}: EventRegistrationFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      z.object({
        participantName: z
          .string()
          .trim()
          .min(2, t("eventRegistration.validation.nameMin"))
          .max(80, t("eventRegistration.validation.nameMax")),
        email: z.string().trim().email(t("eventRegistration.validation.emailInvalid")),
        notes: z
          .string()
          .max(300, t("eventRegistration.validation.notesMax"))
          .optional()
          .or(z.literal("")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateRegistrationDto>({
    resolver: zodResolver(schema),
    defaultValues: {
      participantName: defaultName,
      email: defaultEmail,
      notes: "",
    },
  });

  // Rattache les erreurs serveur 422 aux champs du formulaire (Slide 115)
  useEffect(() => {
    if (!serverError || serverError.status !== 422) return;
    for (const fieldError of serverError.errors) {
      if (KNOWN_FIELDS.has(fieldError.field as keyof CreateRegistrationDto)) {
        setError(fieldError.field as keyof CreateRegistrationDto, {
          type: "server",
          message: fieldError.message,
        });
      }
    }
  }, [serverError, setError]);

  if (registration) {
    const isWaitlisted = registration.status === "WAITLISTED";
    return (
      <Alert
        tone={isWaitlisted ? "warning" : "success"}
        title={
          isWaitlisted
            ? t("eventRegistration.waitlistTitle")
            : t("eventRegistration.successTitle")
        }
      >
        {isWaitlisted
          ? t("eventRegistration.waitlistBody", { position: registration.position ?? 1 })
          : t("eventRegistration.successBody")}
      </Alert>
    );
  }

  const isClosed = eventStatus !== "PUBLISHED";
  const isFull = remainingSeats <= 0;

  const translatedServerMessage = serverError
    ? t(`errors.codes.${serverError.code}`, {
        defaultValue: t("errors.genericDescription"),
      })
    : null;

  return (
    <form
      noValidate
      className={styles.form}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          participantName: values.participantName,
          email: values.email,
          ...(values.notes ? { notes: values.notes } : {}),
        });
      })}
    >
      {translatedServerMessage ? (
        <Alert tone="danger">
          <span>{translatedServerMessage}</span>
          {serverError?.requestId ? (
            <span className={styles.requestId}>
              {" "}
              ({t("errors.requestId", { id: serverError.requestId })})
            </span>
          ) : null}
        </Alert>
      ) : null}

      <Input
        label={t("eventRegistration.participantNameLabel")}
        placeholder={t("eventRegistration.participantNamePlaceholder")}
        autoComplete="name"
        disabled={isClosed || isSubmitting}
        error={errors.participantName?.message}
        {...register("participantName")}
      />

      <Input
        type="email"
        label={t("eventRegistration.emailLabel")}
        placeholder={t("eventRegistration.emailPlaceholder")}
        autoComplete="email"
        disabled={isClosed || isSubmitting}
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label={t("eventRegistration.notesLabel")}
        placeholder={t("eventRegistration.notesPlaceholder")}
        disabled={isClosed || isSubmitting}
        error={errors.notes?.message}
        {...register("notes")}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        disabled={isClosed || isFull || isSubmitting}
        leftIcon={<Ticket size={16} aria-hidden="true" />}
      >
        {isSubmitting
          ? t("eventRegistration.submitting")
          : isClosed
            ? t("eventRegistration.closedButton")
            : isFull
              ? t("eventRegistration.fullButton")
              : t("eventRegistration.submit")}
      </Button>
    </form>
  );
}
