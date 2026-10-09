import { Injectable } from "@nestjs/common";
import { currencyFormatter, httpResponse } from "../lib/utils";

@Injectable()
export class WalletService {
  async getWalletBalance(user: any) {
    const wallet = await user.populate({
      path: "wallet",
      select: { balance: 1, _id: 0 },
    });

    return httpResponse({
      data: {
        balance: currencyFormatter(wallet.wallet.balance, "NGN"),
      },
    });
  }
}
