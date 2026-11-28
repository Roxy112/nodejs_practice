const assert = require("node:assert/strict");
const { setupTestDb, cleanTestDb, teardownTestDb } = require("../helpers/testDb");
const { describe, it, before, beforeEach, after } = require("node:test");

const app = require("../../src/app.js");
const request = require("supertest");

describe("Task API", () => {
    let token;
    let projectId;
    before(async () => {
        await setupTestDb();
    });

    beforeEach(async () => {
        await cleanTestDb();

        await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test",
                account: "test@example.com",
                password: "Test123456"
            });
        const loginRes = await request(app)
            .post("/api/v1/auth/login")
            .send({ account: "test@example.com", password: "Test123456" });
        assert.equal(loginRes.status, 200);
        token = loginRes.body.accessToken;

        const projectRes = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Test Project" });
        assert.equal(projectRes.status, 201);
        projectId = projectRes.body.data.id;
    });

    after(async () => {
        await teardownTestDb();
    });

    describe("createTask", () => {
        it("Should create a task with complete and legal parameters", async () => {
            const task = {
                name: "Task1",
                description: "description",
                priority: "high",
                deadline: "2026-11-20T18:00:00Z"
            }
            const res = await request(app)
                .post(`/api/v1/projects/${projectId}/tasks`)
                .set("Authorization", `Bearer ${token}`)
                .send(task);
            
            assert.equal(res.status, 201);
            assert.equal(res.body.data.name, "Task1");
            assert.equal(Number.isInteger(res.body.data.id), true);
            assert.equal(res.body.data.projectId, projectId);
            assert.partialDeepStrictEqual(res.body.data, {
                name: "Task1",
                description: "description",
                priority: "high",
                deadline: "2026-11-20 18:00:00"
            });
            assert.equal(res.body.data.status, "pending");
        });

        it("should create a task with only name", async () => {
            const res = await request(app)
                .post(`/api/v1/projects/${projectId}/tasks`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Task2"
                });
            
            assert.equal(res.status, 201);
            assert.equal(res.body.data.description, null);
            assert.equal(res.body.data.status, "pending");
            assert.equal(res.body.data.priority, "medium");
            assert.equal(res.body.data.deadline, null);
        });

        it("should create a task and trim from name and description", async () => {
            const res = await request(app)
                .post(`/api/v1/projects/${projectId}/tasks`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "   Task3   ",
                    description: "   description   "
                });
            assert.equal(res.status, 201);
            assert.equal(res.body.data.name, "Task3");
            assert.equal(res.body.data.description, "description");
        });

        it("should throw 400 because of illegal projectId", async () => {
            const res = await request(app)
                .post(`/api/v1/projects/abc/tasks`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Task4"
                });

            assert.equal(res.status, 400);
            assert.equal(res.body.error, "Invalid projectId");
        });

        it("should throw 400 because of illegal name", async () => {
            const res = await request(app)
                .post(`/api/v1/projects/${projectId}/tasks`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: " "
                });
            assert.equal(res.status, 400 );
            assert.equal(Array.isArray(res.body.error), true);
            assert.ok(res.body.error.length > 0);
        });
    });
});