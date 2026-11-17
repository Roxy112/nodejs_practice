const repository = require("../repositories/userRepository");

const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

async function getUser(id) {
    const user = await repository.getUserById(id);
    if (!user) {
        throw new Error("User does not exist");
    }

    return user;
}

async function updateUser(user) {
    const result = await repository.updateUser(user);
    return result;
}

async function changePassword(account, password) {
    const user = await repository.getUser(account);
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
    const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);

    const result = await changePassword(account, passwordHash);
    return result;    
}

module.exports = {
    getUser,
    updateUser,
    changePassword
}