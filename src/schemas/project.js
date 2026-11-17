const z = require("zod");

const createProjectSchema = z
    .object({
        name: z.string().min(1, "The string cannot be empty").max(20), 
        description: z.string().min(0).max(50).nullable(),
    })
    .strict();

const updateProjectSchema = z
        .object({
            name: z.string().min(1, "The String cannot be empty").max(20),
            description: z.string().min(0).max(50).nullable()
        })
        .partial()
        .strict()
        .refine((data) => Object.keys(data).length > 0, {
            message: "No fields provided to update",
        });

module.exports = {
    createProjectSchema,
    updateProjectSchema
}