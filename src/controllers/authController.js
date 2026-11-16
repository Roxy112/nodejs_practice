const service = require("../services/authService");

const z = require("zod");

const {
  signAccessToken,
  signRefreshToken,
  hashToken,
  ACCESS_TTL_MS,
  REFRESH_TTL_MS,
} = require('../utils/tokens');
const crypto = require('crypto');

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
            "message": "Created",
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
        const { account, password } = validation.data;

        const user = await service.login(account, password);

        const jti = crypto.randomUUID();
        const accessToken  = signAccessToken(user);
        const refreshToken = signRefreshToken(user, jti);
        
        // 持久化刷新令牌（存哈希）
        await RefreshToken.create({
        data: {
            userId: user.id,
            jti,
            tokenHash: hashToken(refreshToken),
            userAgent: req.get('user-agent') ?? null,
            ip: req.ip ?? null,
            expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        },
        });

        const cookieBase = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        };

        res.cookie('access_token', accessToken, {
        ...cookieBase,
        path: '/',
        maxAge: ACCESS_TTL_MS,
        });
        res.cookie('refresh_token', refreshToken, {
        ...cookieBase,
        path: '/api/auth/refresh', // 只在刷新接口上发送，缩小暴露面
        maxAge: REFRESH_TTL_MS,
        });

        return res.status(200).json({
        success: true,
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
        },
        });
    } catch (error) {
        next(error);
    }
}

async function logout(req, res, next) {
    // TODO
}

module.exports = {
    login,
    register,
    logout
};