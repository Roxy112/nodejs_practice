## 系统功能
# 用户
支持登录, 登出, 修改个人信息, 注册, 查询个人信息; 

# 项目
支持创建, 删除, 修改, 查询项目, 获取项目列表, 添加项目描述; 

# 任务
支持创建, 删除, 修改, 查询任务, 
可以设置截止日期
包含优先级: low、medium、high、urgent;
状态: 待处理(pending)、进行中(in_progress)、已完成(done)、已取消(canceled);

## 实体属性
User: id(PK), name, account, password_hash, created_at, updated_at;
Project:id(PK), user_id(FK), name, description, created_at, updated_at; 
Task:id(PK), project_id(FK), name, deadline, priority, status, created_at, updated_at;

## 业务规则
# 用户
用户名必须唯一。
密码只能存储哈希值，不能存储明文。
登录成功后返回 JWT（JSON Web Token）。
受保护接口必须验证 JWT。
修改密码需要验证旧密码。
用户不能通过修改请求中的 ID 来访问其他用户的信息。

# 项目
必须登录才能访问项目接口。
创建项目时，user_id 从验证后的 JWT 身份信息获取，不能由客户端指定。
用户只能查看、修改、删除自己的项目。
项目名称不能为空。
删除包含任务的项目时，默认拒绝并返回 409 Conflict。
如果用户显式指定 ?cascade=true，则允许删除项目及其所有任务，删除操作必须保证原子性。

# 任务
只有项目所有者能够操作该项目下的任务。
任务必须属于一个存在且有权访问的项目。
创建任务时不允许客户端指定任务 ID、创建时间等服务端字段。
更新时必须验证状态、优先级是否合法。
截止日期使用统一的 ISO 8601 日期时间格式。
本阶段不支持直接修改任务所属项目；后续可以单独设计任务迁移功能。