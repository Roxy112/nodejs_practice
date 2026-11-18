const repository = require("../repositories/userRepository");

const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

async function getUser(id) {
    const user = await repository.getUserById(id);
    if (!user) {
        const error = new Error("User does not exist");
        error.status = 404;
        throw error;
    }

    return user;
}

async function updateUser(id, user) {
    try {
        return await repository.updateUser(id, user);
    } catch (error) {
        if (error?.code === "ER_DUP_ENTRY") {
            const conflict = new Error("This account is already registered");
            conflict.status = 409;
            throw conflict;
        }

        throw error;
    }
}

async function changePassword(id, password, oldPassword) {
    const user = await repository.getUserById(id);
    if (!user) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }

    const checkPassword = await bcrypt.compare(oldPassword, user.password_hash);
    if (!checkPassword) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }

    if (password === oldPassword) {
        const error = new Error("The old password cannot be the same as the new password");
        error.status = 400;
        throw error;
    }  
    
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await repository.changePassword(id, passwordHash);
    return result;    
}

module.exports = {
    getUser,
    updateUser,
    changePassword
}