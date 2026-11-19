const z = require("zod");

const nameSchema = z.string().trim().min(1, "Task name cannot be empty").max(20);
const descriptionSchema = z.string().trim().max(50).nullable();
const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);
const deadlineSchema = z.iso.datetime().nullable();
const statusSchema = z.enum(["pending", "in_progress", "completed", "canceled"]);

const createTaskSchema = z.object({
        name: nameSchema,
        description: descriptionSchema.optional(),
        priority: prioritySchema.optional(),
        deadline: deadlineSchema.optional()
    })
    .strict();

const updateTaskSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
    status: statusSchema,
    priority: prioritySchema,
    deadline: deadlineSchema
    })
    .partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
            message: "No fields provided to update",
    });

module.exports = {
    createTaskSchema,
    updateTaskSchema
}