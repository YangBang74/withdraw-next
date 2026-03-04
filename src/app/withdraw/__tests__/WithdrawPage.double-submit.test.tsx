import { render, screen, fireEvent } from "@testing-library/react";
import WithdrawPage from "@/app/withdraw/page";

describe("WithdrawPage - double submit protection", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("prevents multiple POST calls on rapid double submit", () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "w1" }),
    } as Response);

    global.fetch = fetchMock;

    render(<WithdrawPage />);

    const amountInput = screen.getByLabelText(/сумма/i);
    const destinationInput = screen.getByLabelText(/адрес назначения/i);
    const confirmCheckbox = screen.getByLabelText(/я подтверждаю/i);
    const submitButton = screen.getByRole("button", { name: /отправить заявку/i });

    fireEvent.change(amountInput, { target: { value: "10" } });
    fireEvent.change(destinationInput, { target: { value: "wallet-double" } });
    fireEvent.click(confirmCheckbox);

    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

