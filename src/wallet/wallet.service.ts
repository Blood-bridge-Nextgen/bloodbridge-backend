import { Injectable } from "@nestjs/common";
import { currencyFormatter, httpResponse, paginatedData } from "../lib/utils";
import { Transaction } from "../mongoose/mongoose.schema";

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

  async getTransactions(user: any, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = query.status;

    const transactions = await Transaction.find({
      user: user._id,
      ...(status ? { status } : {}),
    })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "requestSubmission",
        select: { request: 1, _id: 1 },
        populate: {
          path: "request",
          select: { quantity: 1, pricePerPint: 1 },
        },
      });

    const totalTransactions = await Transaction.countDocuments({
      user: user._id,
      ...(status ? { status } : {}),
    });

    const paginated = paginatedData(query, totalTransactions);

    return httpResponse({
      data: {
        data: transactions,
        meta: paginated,
      },
    });
  }
}
