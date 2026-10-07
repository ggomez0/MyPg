import * as jose from "jose";
import { config } from "../config";

const secret = new TextEncoder().encode(config.JWT_SECRET);

export async function signAdminJwt(adminId: string): Promise<string> {
  return new jose.SignJWT({ sub: adminId, type: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(config.JWT_EXPIRES_IN)
    .sign(secret);
}

export async function signUserJwt(userId: string, projectId: string, role: string): Promise<string> {
  return new jose.SignJWT({ sub: userId, projectId, role, type: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(config.JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verifyJwt(token: string) {
  const { payload } = await jose.jwtVerify(token, secret);
  return payload;
}
