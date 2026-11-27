"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { generateUuid } from "@/api/http";
import { AccountRegistrationForm } from "@/components/auth/AccountRegistrationForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useRegisterAccount } from "@/hooks/useRegisterAccount";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const registerMutation = useRegisterAccount();
  const idempotencyKeyRef = useRef<string>(generateUuid());

  return (
    <AuthLayout
      screen="register"
      title={t("accountRegister.title")}
      subtitle={t("accountRegister.subtitle")}
    >
      <AccountRegistrationForm
        isSubmitting={registerMutation.isPending}
        serverError={registerMutation.error ?? null}
        onSubmit={(dto) => {
          registerMutation.mutate(
            { dto, idempotencyKey: idempotencyKeyRef.current },
            {
              onSuccess: () => {
                idempotencyKeyRef.current = generateUuid();
                router.push("/login?registered=1");
              },
            },
          );
        }}
      />
    </AuthLayout>
  );
}
