"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { RegisterAccountDto } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StrengthMeter } from "@/components/ui/StrengthMeter";
import styles from "./AccountRegistrationForm.module.css";

const KNOWN_FIELDS = new Set<keyof RegisterAccountDto>([
  "displayName",
  "email",
  "password",
]);

export interface AccountRegistrationFormProps {
  readonly isSubmitting?: boolean;
  readonly serverError?: ApiError | null;
  readonly onSubmit: (dto: RegisterAccountDto) => void;
}

function getPasswordLevel(length: number): number {
  if (length === 0) return 0;
  if (length < 6) return 1;
  if (length < 12) return 2;
  if (length < 16) return 3;
  return 4;
}

/**
 * Formulaire de création de compte (US01 / SCRUM-23 — fidèle à Figma 02 · Créer un compte).
 * Politique mot de passe contrat §2 : 12 caractères minimum, sans règles de composition.
 */
export function AccountRegistrationForm({
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: AccountRegistrationFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      z.object({
        displayName: z
          .string()
          .trim()
          .min(2, t("accountRegister.validation.displayNameMin"))
          .max(80, t("accountRegister.validation.displayNameMax")),
        email: z.string().trim().email(t("accountRegister.validation.emailInvalid")),
        password: z.string().min(12, t("accountRegister.validation.passwordMin")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegisterAccountDto>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  const passwordValue = useWatch({ control, name: "password", defaultValue: "" });

  useEffect(() => {
    if (!serverError) return;
    if (serverError.status === 409 && serverError.code === "EMAIL_ALREADY_USED") {
      setError("email", { type: "server", message: t("errors.codes.EMAIL_ALREADY_USED") });
      return;
    }
    if (serverError.status === 422) {
      for (const fieldError of serverError.errors) {
        if (KNOWN_FIELDS.has(fieldError.field as keyof RegisterAccountDto)) {
          setError(fieldError.field as keyof RegisterAccountDto, {
            type: "server",
            message: fieldError.message,
          });
        }
      }
    }
  }, [serverError, setError, t]);

  const isEmailConflict =
    serverError?.status === 409 && serverError.code === "EMAIL_ALREADY_USED";
  const bannerMessage = serverError
    ? t(`errors.codes.${serverError.code}`, { defaultValue: t("errors.genericDescription") })
    : null;

  return (
    <form noValidate className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {bannerMessage ? (
        <Alert
          tone="danger"
          action={
            isEmailConflict ? (
              <Link href="/login" className={styles.alertLink}>
                {t("accountRegister.loginLink")}
              </Link>
            ) : undefined
          }
        >
          {bannerMessage}
        </Alert>
      ) : null}

      <Input
        label={t("accountRegister.displayNameLabel")}
        placeholder={t("accountRegister.displayNamePlaceholder")}
        hint={t("accountRegister.displayNameHint")}
        autoComplete="name"
        disabled={isSubmitting}
        error={errors.displayName?.message}
        {...register("displayName")}
      />

      <Input
        type="email"
        label={t("accountRegister.emailLabel")}
        placeholder={t("accountRegister.emailPlaceholder")}
        autoComplete="email"
        disabled={isSubmitting}
        error={errors.email?.message}
        {...register("email")}
      />

      <div className={styles.passwordGroup}>
        <Input
          type="password"
          label={t("accountRegister.passwordLabel")}
          placeholder={t("accountRegister.passwordPlaceholder")}
          hint={t("accountRegister.passwordHint", { current: passwordValue.length })}
          autoComplete="new-password"
          disabled={isSubmitting}
          error={errors.password?.message}
          {...register("password")}
        />
        <StrengthMeter level={getPasswordLevel(passwordValue.length)} />
      </div>

      <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
        {isSubmitting ? t("accountRegister.submitting") : t("accountRegister.submit")}
      </Button>

      <p className={styles.footerText}>
        {t("accountRegister.alreadyAccount")}{" "}
        <Link href="/login" className={styles.footerLink}>
          {t("accountRegister.loginLink")}
        </Link>
      </p>
    </form>
  );
}
