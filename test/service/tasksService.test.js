const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const taskRepository = require("../../src/repositories/taskRepository");
const projectsRepository = require("../../src/repositories/projectsRepository");
const service = require("../../src/services/tasksServices");

describe("TasksService", () => {
    describe("createTask", () => {
        it("should create task when project belongs to user", async (t) => {
            const taskInput = { name: "Write tests", priority: "high" };
            const expected = { id: 10, projectId: 2, ...taskInput, status: "pending" };

            const findProjectMock = t.mock.method(
                projectsRepository,
                "findOwnedById",
                async () => ({ id: 2, name: "Demo Project" })
            );
            const createTaskMock = t.mock.method(
                taskRepository,
                "createTask",
                async () => expected
            );

            // Note: createTask takes (userId, projectId, task)
            const result = await service.createTask(1, 2, taskInput);

            assert.deepEqual(result, expected);
            assert.equal(findProjectMock.mock.callCount(), 1);
            assert.deepEqual(findProjectMock.mock.calls[0].arguments, [2, 1]);
            assert.equal(createTaskMock.mock.callCount(), 1);
            assert.deepEqual(createTaskMock.mock.calls[0].arguments, [2, 1, taskInput]);
        });

        it("should throw 404 and skip repository.createTask when project is not found", async (t) => {
            t.mock.method(projectsRepository, "findOwnedById", async () => null);
            const createTaskMock = t.mock.method(
                taskRepository,
                "createTask",
                async () => { throw new Error("should not be called"); }
            );

            await assert.rejects(
                () => service.createTask(1, 999, { name: "Task" }),
                {
                    message: "Project not found or unauthorized",
                    status: 404
                }
            );
            assert.equal(createTaskMock.mock.callCount(), 0);
        });
    });

    describe("listTasks", () => {
        it("should return mapped tasks with projectId attached", async (t) => {
            t.mock.method(projectsRepository, "findOwnedById", async () => ({ id: 2 }));
            t.mock.method(taskRepository, "listOwnedByProject", async () => [
                {
                    id: 1,
                    name: "T1",
                    description: "D1",
                    status: "pending",
                    priority: "medium",
                    deadline: null,
                    extraField: "should-be-stripped"
                }
            ]);

            const result = await service.listTasks(2, 1);

            assert.deepEqual(result, [
                {
                    id: 1,
                    projectId: 2,
                    name: "T1",
                    description: "D1",
                    status: "pending",
                    priority: "medium",
                    deadline: null
                }
            ]);
        });
    });

    describe("deleteTask", () => {
        it("should pass task.projectId to repository.deleteTask", async (t) => {
            t.mock.method(taskRepository, "getTask", async () => ({
                id: 5,
                projectId: 22
            }));
            const deleteMock = t.mock.method(
                taskRepository,
                "deleteTask",
                async () => true
            );

            const result = await service.deleteTask(5, 1);

            assert.equal(result, true);
            assert.deepEqual(deleteMock.mock.calls[0].arguments, [5, 22, 1]);
        });
    });
});