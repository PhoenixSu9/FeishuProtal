# 飞书门户项目文档

## 1. 项目简介
本项目是一个基于 React 和 Node.js 开发的工资单查询应用，深度集成了 **飞书（Feishu/Lark）** 的免登功能。旨在为企业员工提供便捷、安全的工资单查询服务，直接嵌入飞书工作台使用。

## 2. 技术架构

### 技术栈
*   **前端 Framework**: React 19 + Vite 7
*   **前端语言**: JavaScript (ES Modules)
*   **后端 Runtime**: Node.js
*   **后端 Web 框架**: Express
*   **容器化**: Docker + Docker Compose
*   **Web 服务器**: Nginx (用于生产环境前端托管及反向代理)

### 数据流向
```
graph LR
    User["用户 (飞书客户端)"] -->|打开应用| Frontend["前端 (React)"]
    Frontend -->|1. 获取 AppID| API["后端 (Express)"]
    Frontend -->|2. tt.requestAccess| Lark[飞书开放平台]
    Lark -->|3. 返回 Code| Frontend
    Frontend -->|4. 提交 Code| API
    API -->|5. 校验 Code & 获取 Token| Lark
    Lark -->|6. 返回 User Info| API
    API -->|7. 返回用户信息| Frontend
    Frontend -->|8. 查询工资数据| SalarySys[工资数据源]

```

## 3. 核心模块说明

### 3.1 飞书认证 (Feishu Auth)
核心逻辑位于 `src/hooks/useFeishuAuth.js` 和 `src/services/feishuService.js`。
*   **流程**: 自动检测 `window.h5sdk` 环境。若在飞书内，自动触发 OAuth 流程；若在开发环境，使用 Mock 数据。
*   **UI**: 配合 `src/components/LoginLoading.jsx` 展示加载动画，确保在获取到用户信息前用户体验流畅。

### 3.2 后端服务 API (`server.js`)
运行在 4000 端口，主要负责与飞书服务器进行安全通信。
*   `GET /api/get_appid`: 获取前端需要的飞书 App ID。
*   `GET /api/callback`: 接收前端传来的 `code`，在服务端换取 `user_access_token` 和用户信息（包含手机号）。
*   `GET /api/health`: 健康检查接口。

### 3.3 工资单展示 (`src/App.jsx`)
*   获取到用户信息后，展示日历视图的工资单。
*   支持按月切换查看详细收入记录。

## 4. 目录结构
```
jump_to_page/
├── dist/                   # 构建产物
├── md/                     # 项目文档
├── src/
│   ├── components/         # UI 组件 (LoginLoading)
│   ├── hooks/              # 自定义 Hooks (useFeishuAuth)
│   ├── services/           # API 服务封装
│   ├── App.jsx             # 主应用组件
│   └── main.jsx            # 入口文件
├── server.js               # Node.js 后端入口
├── vite.config.js          # Vite 配置 (包含 API 代理)
├── Dockerfile.api          # 后端 Docker 构建文件
├── Dockerfile.web          # 前端 Docker 构建文件 (含 Nginx)
├── docker-compose.yml      # 容器编排配置
├── nginx.conf              # Nginx 配置文件
└── package.json            # 项目依赖与脚本
```

## 5. 开发与部署

### 5.1 本地开发
**预置条件**: 使用 `npm install` 安装依赖。
**环境变量**: 需在 `server.js` 中配置 `APP_ID` 和 `APP_SECRET`。

```bash
# 启动后端服务 (端口 4000)
npm run server

# 启动前端开发服务 (端口 5173, 已配置代理转发 /api -> 4000)
npm run dev
```

### 5.2 Docker 部署
项目支持一键容器化部署。

```bash
# 构建并启动服务
docker-compose up -d --build

# 停止服务
docker-compose down
```
**服务端口说明**:
*   **前端访问**: 宿主机 80 端口 (通过 Nginx 转发)
*   **后端 API**: 宿主机 4000 端口 (内部互通)

## 6. 配置说明
*   **vite.config.js**: 配置了 `server.proxy`，将开发环境下的 `/api` 请求转发至本地后端。
*   **nginx.conf**: 生产环境下，Nginx 负责托管静态资源，并将 `/api/` 路径反向代理到 `api` 容器的 4000 端口。

## 7. 联系与支持
如果你觉得这个项目对你有帮助，欢迎给一个 **Star** ⭐️！

如有任何疑问、建议或需要进一步的技术支持，请通过邮件联系我：
*   **Email**: [addroc_sue@163.com]

## 8. 许可证
本项目采用 [Apache License 2.0](LICENSE) 许可证。
