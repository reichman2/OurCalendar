"use server";
import bcrypt from 'bcryptjs';


export const saltRounds = 10;

export async function hashPassword(password: string) {
    // return await argon2.hash(password);
    return await bcrypt.hash(password, saltRounds);
}

export async function compare(plaintext: string, hashed: string) {
    // return await argon2.verify(hashed, plaintext);
    return await bcrypt.compare(plaintext, hashed);
}