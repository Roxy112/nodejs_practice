const z = require("zod");

const nameSchema = z.string().trim().min(1, "Task name cannot be empty").max(20);
const descriptionSchema = z.string().trim().max(50).nullable();
const prioritySchema = z.enum(["low", "medium", "high", "urgent"]).nullable();
const deadlineSchema = z.iso.datetime();

const createTaskSchema = z.object({
        name: nameSchema,
        description: descriptionSchema.optional(),
        priority: prioritySchema.optional(),
        deadline: deadlineSchema.optional()
    })
    .strict();

module.exports = {
    createTaskSchema
}