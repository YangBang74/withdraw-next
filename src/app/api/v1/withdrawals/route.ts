import { NextRequest, NextResponse } from "next/server";

type StoredWithdrawal = {
  id: string;
  amount: number;
  destination: string;
  network: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
};

type CreateBody = {
  amount: number;
  destination: string;
  network: string;
};

const withdrawalsById =
  (globalThis as any).__withdrawalsById ||
  ((globalThis as any).__withdrawalsById = new Map<string, StoredWithdrawal>());

const idempotencyMap =
  (globalThis as any).__withdrawalsIdempotencyMap ||
  ((globalThis as any).__withdrawalsIdempotencyMap = new Map<string, string>());

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? "";

  if (!idempotencyKey) {
    return NextResponse.json(
      { message: "Idempotency key is required." },
      { status: 400 },
    );
  }

  if (idempotencyMap.has(idempotencyKey)) {
    return NextResponse.json(
      { message: "This withdrawal request is already being processed." },
      { status: 409 },
    );
  }

  const body = (await request.json().catch(() => null)) as CreateBody | null;

  if (
    !body ||
    typeof body.amount !== "number" ||
    body.amount <= 0 ||
    !body.destination ||
    !body.network
  ) {
    return NextResponse.json(
      { message: "Invalid payload." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const withdrawal: StoredWithdrawal = {
    id,
    amount: body.amount,
    destination: body.destination,
    network: body.network,
    status: "pending",
    createdAt,
  };

  withdrawalsById.set(id, withdrawal);
  idempotencyMap.set(idempotencyKey, id);

  return NextResponse.json({ id }, { status: 201 });
}

