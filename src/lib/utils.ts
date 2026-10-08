import { HttpStatus } from "@nestjs/common/enums/http-status.enum";

type HttpResponseParams = {
  message?: string;
  data?: any;
  code?: HttpStatus;
};

export type HttpResponse<T = any> = {
  code: HttpStatus;
  data: T;
  message: string;
};

export enum MONGOOSE_ERROR_CODES {
  DUPLICATE_KEY = 11000,
}

export const httpResponse = ({
  code = HttpStatus.OK,
  data = null,
  message = "Request made",
}: HttpResponseParams): HttpResponse => {
  return {
    code,
    data,
    message,
  };
};

export const paginatedData = (query: any, total: number) => {
  const page = query.page || 1;
  const limit = query.limit ? parseInt(query.limit) : 12;
  const skip = (page - 1) * limit;
  const lastPage = Math.ceil(total / limit);
  const nextPage = page < lastPage ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    currentPage: page,
    perPage: limit,
    skip,
    lastPage,
    nextPage,
    prevPage,
    from: skip + 1,
    to: skip + (total > limit ? limit : total),
  };
};

export const currencyFormatter = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount);
};
