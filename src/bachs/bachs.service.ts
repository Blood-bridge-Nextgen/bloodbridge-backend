import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import * as dotenv from "dotenv";

dotenv.config();

@Injectable()
export class BachsService {
  private readonly bachsApi: AxiosInstance;
  constructor() {
    this.bachsApi = axios.create({
      baseURL: process.env.BACHS_API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BACHS_API_KEY}`,
      },
    });
  }

  async listBanks(): Promise<
    {
      name: string;
      code: string;
    }[]
  > {
    return this.bachsApi({
      method: "GET",
      url: "/v1/reference/banks",
    }).then((res) => res.data.banks);
  }

  async resolveAccount(
    accountNumber: string,
    bankCode: string,
  ): Promise<{
    resolved: boolean;
    account_name: string | null;
    account_number: string | null;
  }> {
    return this.bachsApi({
      method: "POST",
      url: "/v1/misc/bank-accounts/resolve",
      data: {
        account_number: accountNumber,
        bank_code: bankCode,
        country: "NG",
      },
    }).then((res) => res.data);
  }

  async createPaymentLink(transaction: any): Promise<string> {
    return this.bachsApi({
      method: "POST",
      url: "/v1/checkout-sessions",
      data: {
        product_cart: [],
        billing_currency: "NGN",
        success_url: "https://bloodbridge-frontend.pxxlspace.cv",
        metadata: {
          transactionId: transaction._id.toString(),
        },
        reference: transaction.reference,
        pricing: {
          currency: "NGN",
          amount: transaction.amount.toString(),
          price_type: "fixed",
        },
      },
    }).then((res) => res.data.checkout_url);
  }
}
