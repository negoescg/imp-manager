'use server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import { eq } from 'drizzle-orm';

export const getUsers = async () => {
  const selectResult = await db.query.users.findMany();
  return selectResult;
};

export async function getUser(email: string) {
  return await db.select().from(users).where(eq(users.email, email));
}

export type NewUser = typeof users.$inferInsert;

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);
  return await db.insert(users).values({ email, password: hash });
}

export const getUsers2 = async () => {
  const result = await db.query.users.findMany();
  return result;
};
