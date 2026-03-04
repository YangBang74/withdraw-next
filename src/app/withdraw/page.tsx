import { WithdrawForm } from "@/features/withdraw";

export default function WithdrawPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-10 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,244,245,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(82,82,91,0.35),_transparent_55%)]" />

      <main className="relative z-10 flex w-full max-w-5xl flex-col gap-10 md:flex-row md:items-start">
        <section className="md:w-5/12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Безопасный вывод USDT
          </div>

          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Вывод средств
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-400">
            Укажите сумму и адрес назначения, подтвердите операцию и получите
            прозрачный статус заявки. Интерфейс защищает от двойных отправок и
            аккуратно восстанавливает последнее состояние.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-4 text-xs text-zinc-400 sm:grid-cols-2 max-w-lg">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 backdrop-blur">
              <dt className="font-medium text-zinc-200">Идемпотентность</dt>
              <dd className="mt-1 text-zinc-400">
                Повторные запросы по одному ключу не создают дубликаты.
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 backdrop-blur">
              <dt className="font-medium text-zinc-200">Устойчивый UI</dt>
              <dd className="mt-1 text-zinc-400">
                Состояния idle / loading / success / error и кнопка Retry.
              </dd>
            </div>
          </dl>
        </section>

        <section className="md:w-7/12">
          <WithdrawForm />
        </section>
      </main>
    </div>
  );
}

