const z = require("zod");

const nameSchema = z.string().trim().min(1, "Project name cannot be empty").max(20).trim();
const descriptionSchema = z.string().trim().min(0).max(50).nullable();
const createProjectSchema = z
    .object({
        name: nameSchema, 
        description: descriptionSchema.optional()
    })
    .strict();

const updateProjectSchema = z
        .object({
            name: nameSchema,
            description: descriptionSchema
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