import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";

const SESSION_COOKIE = "rent_session";
const MODE_COOKIE = "rent_mode";
const SESSION_TTL = 60 * 60 * 24 * 30;

type SessionPayload = { userId: string; exp: number };

function secret() {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

function sign(text: string) {
  return createHmac("sha256", secret()).update(text).digest("hex");
}

function encode(payload: SessionPayload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

function decode(raw: string | undefined): SessionPayload | null {
  if (!raw || !raw.includes(".")) return null;
  const [data, sig] = raw.split(".");
  const expected = sign(data);
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return null;
  if (!timingSafeEqual(left, right)) return null;
  const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

async function ensureBootstrapUser() {
  const count = await db.user.count();
  if (count > 0) return;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      name: process.env.BOOTSTRAP_ADMIN_NAME || "Admin",
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
}

export async function getCurrentUser() {
  await ensureBootstrapUser();
  const jar = await cookies();
  const payload = decode(jar.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return db.user.findUnique({ where: { id: payload.userId } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || !user.isActive) redirect("/login");
  return user;
}

export async function requireAdminUser() {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN) redirect("/dashboard");
  return user;
}

export async function signInWithPassword(email: string, password: string) {
  await ensureBootstrapUser();
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !user.isActive) return false;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return false;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encode({ userId: user.id, exp: Math.floor(Date.now() / 1000) + SESSION_TTL }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL,
  });
  if (user.role === UserRole.ADMIN) {
    jar.set(MODE_COOKIE, "view", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL,
    });
  }
  return true;
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(MODE_COOKIE);
}

export async function isEditMode() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) return false;
  const jar = await cookies();
  return jar.get(MODE_COOKIE)?.value === "edit";
}

export async function setEditMode(value: boolean) {
  await requireAdminUser();
  const jar = await cookies();
  jar.set(MODE_COOKIE, value ? "edit" : "view", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL,
  });
}
