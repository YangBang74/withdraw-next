## Withdraw App

Тестовое приложение для страницы вывода средств (Withdraw) на Next.js App Router + TypeScript + feature-based архитектуре.

### Стек

- Next.js 16 (App Router, `src/app`)
- React 19
- TypeScript
- Zustand — управление состоянием фичи Withdraw
- Jest + Testing Library — unit/интеграционные тесты UI
- Playwright — e2e-тест потока вывода

### Как запустить

```bash
npm install

# dev-сервер
npm run dev

# линтер
npm run lint

# тесты
npm test
```

Приложение доступно по адресу `http://localhost:3000`. Страница Withdraw — `http://localhost:3000/withdraw`.

### Архитектура

- `src/app/withdraw/page.tsx` — страница Withdraw, отвечает только за layout и тексты, подключает фичу через `@/features/withdraw`.
- `src/features/withdraw/` — модуль фичи:
  - `api/withdrawals.ts` — типы `Withdrawal`, `CreateWithdrawalRequest/Response`, функция `createWithdrawal` и `getWithdrawal`, использующие общий HTTP-клиент;
  - `model/withdrawStore.ts` — Zustand-стор:
    - состояние: `amount`, `destination`, `network`, `confirm`, `status` (`idle` | `loading` | `success` | `error`), `error`, `lastRequestId`, `lastRequestAt`, `idempotencyKey`, `lastWithdrawal`;
    - экшены: `setAmount`, `setDestination`, `setNetwork`, `setConfirm`, `submit`, `retry`, `reset`;
    - persistence: сохранение последней заявки в `localStorage` и восстановление при reload в течение 5 минут;
  - `ui/WithdrawForm.tsx` — форма с полями `amount`, `network` (5 популярных сетей USDT), `destination`, `confirm`, состояниями и тостом успеха.
- `src/shared/api/httpClient.ts` — общий HTTP-клиент:
  - `httpRequest<T>()` — обёртка над `fetch` с разбором JSON/текста;
  - `HttpError` — единый тип ошибки с `status` и `payload`.
- `src/app/api/v1/withdrawals/route.ts` — mock POST:
  - читает `Idempotency-Key` из заголовка;
  - при повторе с тем же ключом возвращает `409` с понятным сообщением;
  - создаёт заявку в in-memory Map и возвращает `{ id }`.
- `src/app/api/v1/withdrawals/[id]/route.ts` — mock GET по `id`, возвращает созданную заявку или `404`.

### Логика idempotency и retry

- Каждый успешный нажатый submit генерирует (или переиспользует) `idempotencyKey` через `crypto.randomUUID()` и кладёт его в стор.
- POST `/api/v1/withdrawals` всегда вызывается с этим заголовком `Idempotency-Key`.
- Если бекенд уже видел этот ключ, он возвращает `409` и сообщение `"This withdrawal request is already being processed."`, которое UI показывает пользователю.
- При сетевой ошибке или любой другой ошибке запросов стор переводит `status` в `error`, но **не очищает** поля формы: пользователь может нажать `Retry`, который вызывает `retry()` в сторе и повторяет `submit()` с теми же данными и тем же `idempotencyKey`.
- После успешного POST стор вызывает `getWithdrawal(id)` и сохраняет полную заявку в `lastWithdrawal`, а UI отображает её под формой.

### Устойчивость UI

- Состояния стора:
  - `idle` — начальное состояние, пустая форма;
  - `loading` — сабмит в процессе, кнопка disabled, текст `"Отправляем..."`;
  - `success` — отображается тост об успешном создании заявки и блок `"Заявка создана"` с данными заявки;
  - `error` — показывается сообщение ошибки и кнопка `Retry`.
- Защита от двойного submit:
  - пока `status === "loading"`, экшен `submit()` не делает повторные запросы;
  - кнопка submit disabled при `loading` или невалидной форме.
- При сетевой ошибке/409:
  - текст ошибки выводится в UI;
  - данные формы остаются нетронутыми (можно править и повторять).

### Тесты (unit/integration)

Находятся в `src/app/withdraw/__tests__/`:

- `WithdrawPage.happy.test.tsx` — happy-path:
  - заполняет форму валидными данными;
  - проверяет дизейбл submit при загрузке;
  - мокает два вызова `fetch` (POST + GET) и ожидает блок `"Заявка создана"`.
- `WithdrawPage.api-error.test.tsx` — ошибка API:
  - мокает ответ POST с `409`;
  - проверяет текст ошибки и то, что данные формы не потерялись.
- `WithdrawPage.double-submit.test.tsx` — защита от двойного submit:
  - трижды кликает по submit подряд;
  - проверяет, что POST вызван один раз.

### E2E-тесты (Playwright)

- Конфиг: `playwright.config.ts`.
- Тесты: `e2e/withdraw.e2e.spec.ts`.

Как запустить:

```bash
# разово установить браузеры Playwright
npx playwright install

# запустить dev-сервер в одном терминале
npm run dev

# в другом терминале — e2e-тест
npm run test:e2e
```

### Безопасность

- В проекте нет настоящей авторизации; access token нигде не хранится.
- В реальном приложении токены/сессии должны храниться в httpOnly cookies, а не в `localStorage`, с защитой от CSRF (например, double submit cookie / SameSite=Lax + CSRF-токены).
- API mock не рендерит и не возвращает сырое HTML; UI выводит только ожидаемые типизированные поля (`id`, `amount`, `destination`, `network`, `status`, `createdAt`).
