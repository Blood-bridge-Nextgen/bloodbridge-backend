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
