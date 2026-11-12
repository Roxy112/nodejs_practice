const service = require("../services/authService");

const z = require("zod");

const nameSchema = z.string.min(1).max(50);
const accountSchema = z.email("Invalid Account").toLowerCase();
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

const userSchema = z
    .object({
        name: nameSchema,
        account: accountSchema,
        password: passwordSchema,
    })
    .strict();

const loginSchema = z
    .object({
        account: accountSchema,
        password: passwordSchema,
    })
    .strict();

async function register(req, res, next) {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
    return res.status(400).json({
      error: validation.error.issues.map((issue) => ({
        path: issue.path.join(".") || "(root)",
        message: issue.message,
      })),
    });
  }

    try {
        const result = await service.register(validation.data);
        return res.status(201).json({
            "success": true,
            "message": "Registered",
            "data": {
                "id": result.id,
                "name": result.name,
                "account": result.account
            }
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
    return res.status(400).json({
      error: validation.error.issues.map((issue) => ({
        path: issue.path.join(".") || "(root)",
        message: issue.message,
      })),
    });
  }

    try {
        const account = validation.data.account;
        const password = validation.data.password;

        await service.login(account, password);

        return res.status(201).json({
            "success": true,
            "message": "OK"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    register
};