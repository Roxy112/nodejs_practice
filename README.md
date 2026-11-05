系统功能
用户支持登录, 登出, 修改个人信息, 注册, 查询个人信息; 
项目支持创建, 删除, 修改, 查询项目, 获取项目列表; 
任务支持创建, 删除, 修改, 查询任务, 可以设置截至日期和优先级, 包含三个状态: 待办(todo)、进行中(in_progress)、已完成(done);

实体属性
User: id(PK), name, password_hash, created_at;
Project:id(PK), user_id(FK), name, created_at; 
Task:id(PK), project_id(FK), name, status, priority, deadline, create_at

业务规则
用户只能修改关联至自己id的项目和任务, 项目不存在时不能创建任务, 删除项目时会提示项目中还要任务未删除, 支持一键删除项目及其关联任务