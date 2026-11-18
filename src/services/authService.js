const db = require("../config/db");
const repository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

async function register(user) {
    const account = await repository.getUserByAccount(user.account);
    if (account) {
        const error = new Error("This account is already registered");
        error.status = 409;
        throw error;
    }
    const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
    try {
        const result = await repository.createUser({
            "name": user.name,
            "account": user.account,
            "password_hash": passwordHash
        });
        return result;
    } catch (error) {
        if (error?.code === "ER_DUP_ENTRY") {
            const conflict = new Error("This account is already registered");
            conflict.status = 409;
            throw conflict;
        }

        throw error;
    }
}

async function login(account, password) {
    const user = await repository.getUserByAccount(account);
    if (!user) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }

    return user; 
}

module.exports = {
    register,
    login,
}