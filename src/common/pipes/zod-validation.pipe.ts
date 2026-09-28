import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(
          // typeof error.message === "string"
          //   ? error.message
          //   : JSON.stringify(error.message),
          {
            message: "Validation failed",
            errors: error.issues,
            data: null,
            code: 400,
          },
        );
      }

      // fallback if error is not a ZodError
      throw new BadRequestException("Validation failed");
    }
  }
}
