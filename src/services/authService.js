const db = require("../config/db");
const repository = require("../repositories/authRepository");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

async function register(user) {
    const user = await repository.getUser(user.account);
    if (!user) {
        const error = new Error("This account is already registered");
        error.status = 409;
        throw error;
    }
    const passwordHash = await bcrypt.hash(user.plainPassword, SALT_ROUNDS);
    const result = await repository.createUser({
        "name": user.name,
        "account": user.account,
        "password_hash": passwordHash
    });
    return result;
}

async function login(account, password) {
    const user = await repository.getUser(account);
    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    return user; 
}

async function getUser(account) {
    const user = await repository.getUser(account);
    if (!user) {
        throw new Error("User does not exist");
    }

    return user;
}

module.exports = {
    register,
    login,
    getUser
}