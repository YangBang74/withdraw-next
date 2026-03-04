import { create } from "zustand";
import {
  CreateWithdrawalRequest,
  Withdrawal,
  createWithdrawal,
  getWithdrawal,
} from "@/features/withdraw/api/withdrawals";

export type WithdrawStatus = "idle" | "loading" | "success" | "error";

type WithdrawState = {
  amount: string;
  destination: string;
  network: string;
  confirm: boolean;
  status: WithdrawStatus;
  error: string | null;
  lastRequestId: string | null;
  lastRequestAt: string | null;
  idempotencyKey: string | null;
  lastWithdrawal: Withdrawal | null;
};

type WithdrawActions = {
  setAmount: (value: string) => void;
  setDestination: (value: string) => void;
  setNetwork: (value: string) => void;
  setConfirm: (value: boolean) => void;
  reset: () => void;
  submit: () => Promise<void>;
  retry: () => Promise<void>;
};

type WithdrawStore = WithdrawState & WithdrawActions;

const STORAGE_KEY = "withdraw:lastRequest";
const FIVE_MINUTES_MS = 5 * 60 * 1000;

const initialState: WithdrawState = {
  amount: "",
  destination: "",
  network: "ethereum",
  confirm: false,
  status: "idle",
  error: null,
  lastRequestId: null,
  lastRequestAt: null,
  idempotencyKey: null,
  lastWithdrawal: null,
};

function loadPersistedState(): Partial<WithdrawState> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as {
      lastRequestId: string;
      lastRequestAt: string;
      lastWithdrawal: Withdrawal;
    };

    const lastTs = new Date(parsed.lastRequestAt).getTime();
    const now = Date.now();

    if (Number.isNaN(lastTs) || now - lastTs > FIVE_MINUTES_MS) {
      return {};
    }

    return {
      lastRequestId: parsed.lastRequestId,
      lastRequestAt: parsed.lastRequestAt,
      lastWithdrawal: parsed.lastWithdrawal,
      status: "success" as const,
    };
  } catch {
    return {};
  }
}

function persistState(state: WithdrawState) {
  if (typeof window === "undefined") {
    return;
  }

  if (!state.lastRequestId || !state.lastRequestAt || !state.lastWithdrawal) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const payload = {
    lastRequestId: state.lastRequestId,
    lastRequestAt: state.lastRequestAt,
    lastWithdrawal: state.lastWithdrawal,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export const useWithdrawStore = create<WithdrawStore>((set, get) => {
  const hydrated = loadPersistedState();

  const baseState: WithdrawState = {
    ...initialState,
    ...hydrated,
  };

  const wrappedSet = (partial: Partial<WithdrawStore>) => {
    set(partial);
    persistState(get());
  };

  return {
    ...baseState,

    setAmount: (value) => wrappedSet({ amount: value }),
    setDestination: (value) => wrappedSet({ destination: value }),
    setNetwork: (value: string) => wrappedSet({ network: value }),
    setConfirm: (value: boolean) => wrappedSet({ confirm: value }),

    reset: () => wrappedSet(initialState),

    submit: async () => {
      const { amount, destination, network, confirm, status } = get();

      if (status === "loading") {
        return;
      }

      const numericAmount = Number(amount);
      if (
        !confirm ||
        !destination.trim() ||
        !network ||
        Number.isNaN(numericAmount) ||
        numericAmount <= 0
      ) {
        return;
      }

      const idempotencyKey =
        get().idempotencyKey ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : "");

      wrappedSet({
        status: "loading",
        error: null,
        idempotencyKey,
      });

      const payload: CreateWithdrawalRequest = {
        amount: numericAmount,
        destination: destination.trim(),
        network,
      };

      try {
        const created = await createWithdrawal(payload, { idempotencyKey });
        const withdrawal = await getWithdrawal(created.id);

        const now = new Date().toISOString();

        wrappedSet({
          status: "success",
          error: null,
          lastRequestId: created.id,
          lastRequestAt: now,
          lastWithdrawal: withdrawal,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unexpected error while creating withdrawal.";

        wrappedSet({
          status: "error",
          error: message,
        });
      }
    },

    retry: async () => {
      const { status } = get();
      if (status !== "error") {
        return;
      }

      await get().submit();
    },
  };
});

