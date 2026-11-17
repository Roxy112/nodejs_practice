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

async function updateUser(id, user) {
    const result = await repository.updateUser(id, user);
    return result;
}

async function changePassword(id, account, password) {
    const user = await repository.getUserById(id);
    if (!user) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }
    
    const checkPassword = await bcrypt.compare(password, user.password_hash);
    if (checkPassword) {
        const error = new Error("The old password cannot be the same as the new password");
        error.status = 401;
        throw error;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await repository.changePassword(account, passwordHash);
    return result;    
}

module.exports = {
    getUser,
    updateUser,
    changePassword
}