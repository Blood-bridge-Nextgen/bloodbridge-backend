import { Injectable } from "@nestjs/common";
import { httpResponse, paginatedData } from "../lib/utils";
import { MailService } from "../mail/mail.service";
import { AccountDetails, Payout } from "../mongoose/mongoose.schema";
import { PayoutResource } from "./payout.resource";
import { AccountDetailsSchemaType, PayoutSchemaType } from "./payout.schema";

@Injectable()
export class PayoutService {
  constructor(private readonly mail: MailService) {}

  async updateAccountDetails(body: AccountDetailsSchemaType, user: any) {
    const accountDetails = await AccountDetails.findOneAndUpdate(
      { user: user._id },
      { $set: body, $setOnInsert: { user: user._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).select({
      _id: 0,
      accountName: 1,
      accountNumber: 1,
      bankName: 1,
    });

    return httpResponse({
      data: accountDetails,
    });
  }

  async getAccountDetails(user: any) {
    const accountDetails = await AccountDetails.findOne({
      user: user._id,
    }).select({
      _id: 0,
      accountName: 1,
      accountNumber: 1,
      bankName: 1,
    });

    return httpResponse({
      data: accountDetails,
    });
  }

  async submitPayout(user: any, body: PayoutSchemaType) {
    const userWithWallet = await user.populate({
      path: "wallet",
      select: { balance: 1, _id: 0 },
    });

    if (userWithWallet.wallet.balance < body.amount) {
      return httpResponse({
        code: 400,
        message: "Insufficient balance",
      });
    }

    const numberOfPayoutsThisWeek = await Payout.countDocuments({
      user: user._id,
      status: "pending",
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    });

    if (numberOfPayoutsThisWeek >= 1) {
      return httpResponse({
        code: 400,
        message: "You can only submit 1 payout request per week",
      });
    }

    await Payout.create({
      user: user._id,
      amount: body.amount,
    });

    return httpResponse({
      message: "Payout request submitted successfully",
    });
  }

  async getDonorPayouts(user: any, query: any) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const status = query.status ? query.status : null;
    const skip = (page - 1) * limit;
    const payouts = await Payout.find({
      user: user._id,
      ...(status ? { status } : {}),
    })
      .select({
        _id: 1,
        amount: 1,
        status: 1,
        createdAt: 1,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPayouts = await Payout.countDocuments({
      user: user._id,
      ...(status ? { status } : {}),
    });
    const data = PayoutResource.collection(payouts);
    const pagination = paginatedData(query, totalPayouts);

    return httpResponse({
      data: {
        data,
        meta: pagination,
      },
    });
  }

  async getPayout(payoutId: string, user: any) {
    const payout = await Payout.findOne({
      _id: payoutId,
      ...(user.role === "admin" ? {} : { user: user._id }),
    })
      .select({
        _id: 1,
        amount: 1,
        status: 1,
        createdAt: 1,
      })
      .populate({
        path: "user",
        select: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
        },
      });

    return httpResponse({
      data: payout,
    });
  }
}
