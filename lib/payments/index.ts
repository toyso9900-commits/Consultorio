/**
 * Payment abstraction for V1.
 *
 * The provider only decides whether the charge succeeded and returns a
 * provider reference. The `Payment` audit row is written by the caller
 * (server action) inside a Prisma `$transaction` together with the
 * `PatientSubscription` upsert, so both rows commit or roll back atomically.
 *
 * Swapping in a real gateway (Stripe, MercadoPago) is a one-line change
 * on `paymentProvider` plus a new implementation below.
 */
export interface PaymentProvider {
  charge(input: {
    payerId: string;
    payeeId: string;
    amount: number;
    currency: string;
  }): Promise<{
    status: "PAID" | "FAILED";
    providerRef?: string;
    errorMessage?: string;
  }>;
}

export const testPaymentProvider: PaymentProvider = {
  async charge() {
    return {
      status: "PAID",
      providerRef: `test_${crypto.randomUUID()}`,
    };
  },
};

export const paymentProvider: PaymentProvider = testPaymentProvider;
