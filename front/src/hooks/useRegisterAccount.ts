"use client";

import { useMutation } from "@tanstack/react-query";
import { api, type RegisterAccountDto, type UserResponse } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { generateUuid } from "@/api/http";

export interface RegisterAccountVariables {
  readonly dto: RegisterAccountDto;
  readonly idempotencyKey?: string;
}

/**
 * Mutation de création de compte (`POST /api/auth/register`, US01).
 */
export function useRegisterAccount() {
  return useMutation<UserResponse, ApiError, RegisterAccountVariables>({
    mutationFn: ({ dto, idempotencyKey }) =>
      api.registerAccount(dto, {
        idempotencyKey: idempotencyKey ?? generateUuid(),
      }),
  });
}
