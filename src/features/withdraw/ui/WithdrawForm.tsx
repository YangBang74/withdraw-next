"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useWithdrawStore } from "@/features/withdraw/model/withdrawStore";

export function WithdrawForm() {
  const [isMounted, setIsMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    amount,
    destination,
    network,
    confirm,
    status,
    error,
    lastWithdrawal,
    setAmount,
    setDestination,
    setNetwork,
    setConfirm,
    submit,
    retry,
  } = useWithdrawStore();

  const isValid =
    Number(amount) > 0 &&
    destination.trim().length > 0 &&
    network.trim().length > 0 &&
    confirm;

  const isSubmitting = status === "loading";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (status === "success") {
      setShowToast(true);
      const id = window.setTimeout(() => setShowToast(false), 3200);
      return () => window.clearTimeout(id);
    }

    return undefined;
  }, [status, isMounted]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!isValid || isSubmitting) return;

    void submit();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {showToast && (
        <div className="fixed inset-x-0 top-4 z-30 flex justify-center px-4 sm:justify-end sm:px-6">
          <div className="flex items-center gap-3 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 shadow-lg shadow-emerald-900/40 backdrop-blur">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            <span>Ваш запрос на вывод успешно создан.</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="space-y-1">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Сумма (USDT)
          </label>
          <input
            id="amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="network"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Сеть USDT
          </label>
          <select
            id="network"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="block w-full cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
          >
            <option value="ethereum">Ethereum (ERC20)</option>
            <option value="tron">TRON (TRC20)</option>
            <option value="bsc">BNB Smart Chain (BEP20)</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum One</option>
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Адрес назначения
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
            placeholder="Адрес USDT-кошелька"
            required
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id="confirm"
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <label
            htmlFor="confirm"
            className="text-sm text-zinc-700 dark:text-zinc-300"
          >
            Я подтверждаю, что хочу вывести средства на указанный адрес.
          </label>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
          >
            {isSubmitting ? "Отправляем..." : "Отправить заявку"}
          </button>

          {status === "error" && (
            <div className="space-y-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              <p>{error ?? "Что-то пошло не так при обработке запроса."}</p>
              <button
                type="button"
                onClick={() => void retry()}
                className="text-xs font-medium underline underline-offset-4"
              >
                Повторить
              </button>
            </div>
          )}

          {status === "success" && lastWithdrawal && (
            <div className="space-y-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100">
              <p className="font-medium">Заявка создана</p>
              <p>
                <span className="font-semibold">ID:</span> {lastWithdrawal.id}
              </p>
              <p>
                <span className="font-semibold">Сумма:</span>{" "}
                {lastWithdrawal.amount} USDT
              </p>
              <p>
                <span className="font-semibold">Адрес назначения:</span>{" "}
                {lastWithdrawal.destination}
              </p>
              <p>
                <span className="font-semibold">Сеть:</span>{" "}
                {lastWithdrawal.network}
              </p>
              <p>
                <span className="font-semibold">Статус:</span>{" "}
                {lastWithdrawal.status}
              </p>
            </div>
          )}
        </div>
      </form>
    </>
  );
}

