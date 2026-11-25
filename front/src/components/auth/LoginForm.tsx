"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { ApiError } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./AuthForm.module.css";

export interface LoginFormValues {
  email: string;
  password: string;
}

const KNOWN_FIELDS = new Set<keyof LoginFormValues>(["email", "password"]);

export interface LoginFormProps {
  readonly isSubmitting?: boolean;
  readonly serverError?: ApiError | null;
  readonly notice?: ReactNode;
  readonly onSubmit: (values: LoginFormValues) => void;
}

export function LoginForm({
  isSubmitting = false,
  serverError = null,
  notice = null,
  onSubmit,
}: LoginFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().email(t("login.validation.emailInvalid")),
        password: z.string().min(1, t("login.validation.passwordRequired")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (serverError?.status !== 422) return;
    for (const fieldError of serverError.errors) {
      if (KNOWN_FIELDS.has(fieldError.field as keyof LoginFormValues)) {
        setError(fieldError.field as keyof LoginFormValues, {
          type: "server",
          message: fieldError.message,
        });
      }
    }
  }, [serverError, setError]);

  return (
    <form noValidate className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {serverError ? (
        <Alert tone="danger">
          {t(`errors.codes.${serverError.code}`, {
            defaultValue: t("errors.genericDescription"),
          })}
        </Alert>
      ) : (
        notice
      )}

      <Input
        type="email"
        label={t("login.emailLabel")}
        autoComplete="email"
        disabled={isSubmitting}
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        type="password"
        label={t("login.passwordLabel")}
        autoComplete="current-password"
        disabled={isSubmitting}
        error={errors.password?.message}
        {...register("password")}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isSubmitting}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting ? t("login.submitting") : t("login.submit")}
      </Button>

      <p className={styles.switch}>
        <span>{t("login.noAccount")}</span>
        <Link href="/register" className={styles.switchLink}>
          {t("login.registerLink")}
        </Link>
      </p>
    </form>
  );
}
