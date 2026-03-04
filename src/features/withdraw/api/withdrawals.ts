import { httpRequest, HttpError } from "@/shared/api/httpClient";

export type WithdrawalStatus = "pending" | "completed" | "failed";

export type Withdrawal = {
  id: string;
  amount: number;
  destination: string;
  network: string;
  status: WithdrawalStatus;
  createdAt: string;
};

export type CreateWithdrawalRequest = {
  amount: number;
  destination: string;
  network: string;
};

export type CreateWithdrawalResponse = {
  id: string;
};

export async function createWithdrawal(
  payload: CreateWithdrawalRequest,
  options: { idempotencyKey: string },
): Promise<CreateWithdrawalResponse> {
  try {
    return await httpRequest<CreateWithdrawalResponse>("/api/v1/withdrawals", {
      method: "POST",
      headers: {
        "Idempotency-Key": options.idempotencyKey,
      },
      body: payload,
    });
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      throw new Error(
        (error.payload as any)?.message ??
          "Этот запрос на вывод уже обрабатывается.",
      );
    }

    if (error instanceof HttpError) {
      throw new Error(
        (error.payload as any)?.message ?? "Не удалось создать заявку на вывод.",
      );
    }

    throw error;
  }
}

export async function getWithdrawal(id: string): Promise<Withdrawal> {
  try {
    return await httpRequest<Withdrawal>(`/api/v1/withdrawals/${id}`, {
      method: "GET",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(
        (error.payload as any)?.message ?? "Не удалось загрузить заявку.",
      );
    }

    throw error;
  }
}

