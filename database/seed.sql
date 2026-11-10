-- ========================================================
-- seed.sql: 基础初始数据与测试数据
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 清空旧数据并重置自增计数器
TRUNCATE TABLE `task`;
TRUNCATE TABLE `project`;
TRUNCATE TABLE `user`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. 插入用户数据 (密码明文示例均为 123456 的预哈希串)
INSERT INTO `user` (`id`, `name`, `account`, `password_hash`) VALUES
(1, '系统管理员', 'admin@example.com', '$2a$12$e8YkZ8u2qf4kY5sYV7jXeeH6z.W9gU/6lZ1v1mG1q2w3e4r5t6y7u'),
(2, '张三', 'zhangsan@example.com', '$2a$12$9876543210zyxwvutsrqponmlkjihgfedcba0987654321fedcba');

-- 2. 插入关联项目数据
INSERT INTO `project` (`id`, `user_id`, `name`, `description`) VALUES
(1, 1, '内部运维管理系统', '核心内部工具与日志监控平台'),
(2, 2, '个人待办事项系统', '用于日常任务与项目进度追踪');

-- 3. 插入关联任务数据
INSERT INTO `task` (`id`, `project_id`, `name`, `description`, `status`, `priority`, `deadline`) VALUES
(1, 1, '配置自动化部署流水线', '接入 GitLab CI 自动化构建与测试镜像', 'in_progress', 'urgent', '2026-11-20 18:00:00'),
(2, 1, '集成错误监控 Sentry', '统一前端与服务端崩溃上报', 'pending', 'high', '2026-11-25 12:00:00'),
(3, 2, '设计数据库 ER 模型', '完成 user、project、task 的关联表设计', 'completed', 'high', '2026-11-10 18:00:00'),
(4, 2, '编写 Repository 单元测试', '覆盖用户越权与事务逻辑', 'pending', 'medium', NULL);