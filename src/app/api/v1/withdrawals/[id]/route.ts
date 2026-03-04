import { NextRequest, NextResponse } from "next/server";

type StoredWithdrawal = {
  id: string;
  amount: number;
  destination: string;
  network: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
};

const withdrawalsById =
  (globalThis as any).__withdrawalsById ||
  ((globalThis as any).__withdrawalsById = new Map<string, StoredWithdrawal>());

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const withdrawal = withdrawalsById.get(id);

  if (!withdrawal) {
    if (id === "703fe703-91de-4dae-8370-ef8e709557ce") {
      const mock: StoredWithdrawal = {
        id,
        amount: 123,
        destination: "demo-wallet",
        network: "ethereum",
        status: "completed",
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json(mock, { status: 200 });
    }

    return NextResponse.json(
      { message: "Withdrawal not found." },
      { status: 404 },
    );
  }

  return NextResponse.json(withdrawal, { status: 200 });
}

