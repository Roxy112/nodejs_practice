const db = require("../config/db");
const repository = require("../repositories/authRepository");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

// 注册：哈希密码后交给 repository 存储
async function register(user) {
    const passwordHash = await bcrypt.hash(user.plainPassword, SALT_ROUNDS);
    const result = await repository.createUser({
        "name": user.name,
        "account": user.account,
        "password": passwordHash,
    });
    return result;
}

// 登录：取出哈希，比对密码
async function login(account, plainPassword) {
    const user = await repository.findUserByAccount(account);
    if (!user) {
        // 统一抛出模糊的错误信息，避免泄露“用户是否存在”
        throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    return user; 
}

async function getUserInformation(account) {
    const user = await repository.findUserByAccount(account);
    if (!user) {
        throw new Error("User does not exist");
    }

    return user;
}

module.exports = {
    register,
    login,
    getUserInformation
}