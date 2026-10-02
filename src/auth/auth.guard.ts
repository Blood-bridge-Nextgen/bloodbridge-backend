import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  Type,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as dotenv from "dotenv";
import { User } from "../mongoose/mongoose.schema";

dotenv.config();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];
    let token = this.extractTokenFromHeader(request);
    // Dev-only: allow token via ?token= for Swagger when Authorize doesn't send the header
    if (!token && process.env.NODE_ENV !== "production") {
      const q = request.query?.token;
      token = typeof q === "string" ? q.trim() : undefined;
    }
    if (!token) {
      throw new UnauthorizedException(
        authHeader
          ? "Invalid Authorization format. Use: Bearer <your-jwt-token>"
          : "Missing Authorization header. In Swagger: click Authorize, paste your token (no 'Bearer '), then retry. Or add ?token=YOUR_JWT to the URL (dev only).",
      );
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException(
        "Server auth not configured (JWT_SECRET)",
      );
    }
    let payload: { userId?: number };
    try {
      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException(
        "Invalid or expired token. Get a new one from signup/phone or verify-login, then Authorize again in Swagger.",
      );
    }
    const user = await User.findById(payload.userId)
      .select({
        firstName: 1,
        lastName: 1,
        otherNames: 1,
        organizationName: 1,
        email: 1,
        phone: 1,
        address: 1,
        role: 1,
        dob: 1,
        status: 1,
      })
      .populate({
        path: "kyc",
        select: {
          status: 1,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        "User not found. Token may be from a deleted account.",
      );
    }

    if (user.status === "suspended") {
      throw new ForbiddenException(
        "Your account has been suspended. Please contact support for assistance.",
      );
    }

    request["user"] = user;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const headers = request.headers as { authorization?: string };
    const raw = headers.authorization?.trim();
    if (!raw) return undefined;
    const parts = raw.split(/\s+/);
    if (parts[0] !== "Bearer" || !parts[1]) return undefined;
    // In case user pasted "Bearer <token>" in Swagger, take everything after first "Bearer"
    let token = parts.slice(1).join(" ").trim();
    if (token.toLowerCase().startsWith("bearer "))
      token = token.slice(7).trim();
    return token || undefined;
  }
}

export function RoleGuard(
  role: "donor" | "facility" | "admin",
): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        return false;
      }

      return user.role === role;
    }
  }

  return mixin(RoleGuardMixin);
}

export function VerificationGuard(): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      return !!user.emailVerifiedAt;
    }
  }

  return mixin(RoleGuardMixin);
}

export function StatusGuard(
  status: "pending" | "active" | "suspended",
): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        return false;
      }

      return user.status === status;
    }
  }

  return mixin(RoleGuardMixin);
}
