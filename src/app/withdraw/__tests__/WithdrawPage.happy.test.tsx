import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WithdrawPage from "@/app/withdraw/page";

describe("WithdrawPage - happy path", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("submits a valid withdrawal and shows success state", async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "w1" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: "w1",
          amount: 100,
          destination: "wallet-123",
          status: "pending",
          createdAt: new Date().toISOString(),
        }),
      } as Response);

    // @ts-expect-error override global
    global.fetch = fetchMock;

    render(<WithdrawPage />);

    const amountInput = screen.getByLabelText(/сумма/i);
    const destinationInput = screen.getByLabelText(/адрес назначения/i);
    const confirmCheckbox = screen.getByLabelText(/я подтверждаю/i);
    const submitButton = screen.getByRole("button", { name: /отправить заявку/i });

    expect(submitButton).toBeDisabled();

    fireEvent.change(amountInput, { target: { value: "100" } });
    fireEvent.change(destinationInput, { target: { value: "wallet-123" } });
    fireEvent.click(confirmCheckbox);

    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/заявка создана/i)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

