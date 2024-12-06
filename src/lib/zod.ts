import { object, string } from "zod";


export const userSchema = object({
    username: string({ required_error: "Username is a required field." }).min(3).max(32).refine(s => s.match(/^[a-z0-9_]+$/i), "Username must be alphanumeric"),
    password: string({ required_error: "Password is a required field." }).min(8, "The password must be at least 8 characters.").max(191, "The password is too long!")
});