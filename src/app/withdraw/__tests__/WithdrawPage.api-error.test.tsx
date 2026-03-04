import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WithdrawPage from "@/app/withdraw/page";

describe("WithdrawPage - API error", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows error message when API returns error and preserves form data", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ message: "This withdrawal request is already being processed." }),
    } as Response);

    global.fetch = fetchMock;

    render(<WithdrawPage />);

    const amountInput = screen.getByLabelText(/сумма/i) as HTMLInputElement;
    const destinationInput = screen.getByLabelText(/адрес назначения/i) as HTMLInputElement;
    const confirmCheckbox = screen.getByLabelText(/я подтверждаю/i);
    const submitButton = screen.getByRole("button", { name: /отправить заявку/i });

    fireEvent.change(amountInput, { target: { value: "50" } });
    fireEvent.change(destinationInput, { target: { value: "wallet-err" } });
    fireEvent.click(confirmCheckbox);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/уже обрабатывается/i),
      ).toBeInTheDocument();
    });

    expect(amountInput.value).toBe("50");
    expect(destinationInput.value).toBe("wallet-err");
  });
});

