import { ResourceInterface } from "../lib/interfaces";
import { currencyFormatter } from "../lib/utils";

export type PayoutResourceType = {
  _id: any;
  amount: string;
  status: "pending" | "completed" | "rejected";
  createdAt: string;
  user: any;
};

export type Payout = {
  _id: any;
  amount: number;
  status: "pending" | "completed" | "rejected";
  createdAt: Date;
  user: any;
};

export class PayoutResource implements ResourceInterface<PayoutResourceType> {
  constructor(public item: Payout) {}

  static collection(items: Payout[]): PayoutResourceType[] {
    return items.map((item) => new PayoutResource(item).toJson());
  }

  toJson(): PayoutResourceType {
    return this.extractObject();
  }

  extractObject(data?: Payout): PayoutResourceType {
    const src = data ?? this.item;

    return {
      _id: src._id,
      amount: currencyFormatter(src.amount, "NGN"),
      status: src.status,
      createdAt: src.createdAt.toLocaleString(),
      user: src?.user,
    };
  }
}
