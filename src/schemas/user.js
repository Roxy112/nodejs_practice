const z = require("zod");

const idSchema = z.number().int().positive();
const nameSchema = z.string().min(1, "User name cannot be empty").max(50).trim();
const accountSchema = z
    .email({
        error: (issue) =>
            issue.input === undefined
                ? "Account is required"
                : "Invalid Account",
    })
    .max(50)
    .toLowerCase();
const passwordSchema = z
    .string()
    .min(8, `Password length must be at least than 8`)
    .max(72, `Password length must be at most than 72`)
    .refine((pwd) => /[A-Z]/.test(pwd), {
        message: "The password must contain at least one uppercase letter",
    })
    .refine((pwd) => /[a-z]/.test(pwd), {
        message: "The password must contain at least one lowercase letter",
    })
    .refine((pwd) => /[0-9]/.test(pwd), {
        message: "The password must contain at least one digit",
    });

const registerSchema = z
    .object({
        name: nameSchema,
        account: accountSchema,
        password: passwordSchema,
    })
    .strict();

const loginSchema = z
    .object({
        account: accountSchema,
        password: z.string(),
    })
    .strict();

const userSchema = z
    .object({
        name: nameSchema,
        account: accountSchema
    })
    .strict()
    .partial();

const changePasswordSchema = z
    .object({
        password: passwordSchema,
        oldPassword: z.string().min(1).max(72)
    })
    .strict();

module.exports = {
    idSchema,
    passwordSchema,
    accountSchema,
    registerSchema,
    loginSchema,
    userSchema,
    changePasswordSchema
}