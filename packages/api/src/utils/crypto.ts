import argon2 from "argon2";
import { nanoid } from "nanoid";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function generateApiKey() {
  const prefix = nanoid(8);
  const secret = nanoid(32);
  const key = `mypg_${prefix}_${secret}`;
  return { prefix, secret, key };
}
