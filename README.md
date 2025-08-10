# Mastra Code Review Agent

基于 Mastra 架构的智能代码审查代理：**Cloudflare Workers → MastraClient → Mastra Server → Claude API**

## 🏗️ 架构设计

```
用户请求 → Cloudflare Workers → MastraClient → Mastra Server → Claude API
```

### 优势
- ✅ **完整的 Mastra 生态系统**：工作流、代理管理、记忆功能
- ✅ **可扩展性强**：易于添加新的代理和工作流
- ✅ **企业级架构**：适合复杂的 AI 应用场景
- ✅ **状态管理**：支持记忆和上下文保持
- ✅ **监控和日志**：完整的请求链路追踪

## 功能特性

- 🔍 智能代码分析和审查
- 🛡️ 安全漏洞检测
- ⚡ 性能优化建议
- 📝 代码质量评估
- 🤖 使用 Claude 3.5 Sonnet 模型
- 🔄 支持工作流编排
- 💾 代理记忆功能

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/limuran/mastra-codereview-agent.git
cd mastra-codereview-agent
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 必需：Anthropic API Key
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Mastra 服务器配置
MASTRA_BASE_URL=http://localhost:4111

# 生产环境可能需要的配置
# MASTRA_BASE_URL=https://your-mastra-server.com
```

### 4. 启动 Mastra 服务器

```bash
npm run dev
```

服务器将在 `http://localhost:4111` 启动，包含：
- 代码审查代理
- 工作流引擎
- API 端点

### 5. 测试本地功能

```bash
# 测试代码审查 API
curl -X POST http://localhost:4111/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function calculateTotal(items) { let total = 0; for(let i = 0; i < items.length; i++) { total += items[i].price * items[i].quantity; } return total; }",
    "language": "javascript",
    "filename": "calculator.js",
    "context": "E-commerce shopping cart calculation"
  }'
```

## 🚀 部署到生产环境

### 第一步：部署 Mastra 服务器

选择你的服务器平台：

#### 选项 A：使用 Railway
```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 创建项目
railway init

# 4. 设置环境变量
railway variables set ANTHROPIC_API_KEY=your-key-here

# 5. 部署
railway up
```

#### 选项 B：使用 Vercel
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 部署
vercel

# 3. 设置环境变量
vercel env add ANTHROPIC_API_KEY
```

#### 选项 C：使用 Docker
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4111
CMD ["npm", "run", "start"]
```

### 第二步：部署 Cloudflare Workers

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 更新 Mastra 服务器地址
# 编辑 wrangler.toml 中的 MASTRA_BASE_URL

# 3. 部署 Worker
wrangler deploy
```

### 第三步：更新 Worker 配置

编辑 `wrangler.toml`：

```toml
[env.production]
name = "mastra-codereview-agent"
compatibility_date = "2024-01-01"
node_compat = true

[vars]
MASTRA_BASE_URL = "https://your-mastra-server.railway.app"  # 你的 Mastra 服务器地址
```

## 📊 API 使用

### POST /api/review

**请求体：**
```json
{
  "code": "your code here",
  "language": "javascript",
  "filename": "example.js",
  "context": "Optional context about the code"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "overall_rating": 8,
    "issues": [
      {
        "type": "security",
        "severity": "high",
        "line": 2,
        "description": "Potential SQL injection vulnerability",
        "suggestion": "Use parameterized queries instead of string concatenation"
      }
    ],
    "positive_aspects": [
      "Clear variable naming",
      "Good function structure"
    ],
    "summary": "Code has security concerns but good overall structure"
  }
}
```

## 🏗️ 项目结构

```
src/
├── mastra/           # 🎯 Mastra 服务器入口点
│   └── index.ts      # Mastra 实例配置
├── agents/           # 🤖 AI 代理定义
│   └── codeReviewer.ts
├── workflows/        # 🔄 工作流程定义
│   └── reviewWorkflow.ts
├── api/             # 🌐 API 处理器（使用 MastraClient）
│   └── review.ts
├── cloudflare/      # ☁️ Cloudflare Workers
│   └── worker.ts     # Worker 入口点
└── index.ts         # 主入口文件
```

## 🔧 架构优势详解

### 1. **Mastra 服务器层**
- 集中管理所有 AI 代理
- 工作流编排和执行
- 状态和记忆管理
- 统一的日志和监控

### 2. **Cloudflare Workers 层**
- 全球边缘计算节点
- 自动扩容和负载均衡
- CORS 处理和 API 网关功能
- 快速冷启动

### 3. **MastraClient 连接**
- 类型安全的 API 调用
- 自动重试和错误处理
- 支持流式响应
- 统一的接口规范

## 🛠️ 开发和自定义

### 添加新的代码审查规则

编辑 `src/agents/codeReviewer.ts`：

```typescript
export const codeReviewAgent = new Agent({
  name: 'code-reviewer',
  instructions: `
    你是一个专业的代码审查专家。请重点关注：
    1. 安全漏洞检测
    2. 性能优化建议
    3. 代码可维护性
    4. 最佳实践检查
    
    特别注意：
    - SQL 注入风险
    - XSS 攻击向量
    - 内存泄漏可能性
    - 错误处理完整性
  `,
  model: anthropic('claude-3-5-sonnet-20241022'),
  outputSchema: CodeReviewSchema
});
```

### 创建新的工作流

在 `src/workflows/` 中添加新文件：

```typescript
// src/workflows/securityAuditWorkflow.ts
export const securityAuditWorkflow = new Workflow({
  name: 'security-audit-workflow',
  triggerSchema: z.object({
    code: z.string(),
    language: z.string()
  })
});

securityAuditWorkflow.step({
  id: 'security-scan',
  execute: async ({ context }) => {
    // 安全扫描逻辑
  }
});
```

### 添加新的 API 端点

在 `src/cloudflare/worker.ts` 中添加路由：

```typescript
// 添加安全审计端点
if (url.pathname === '/api/security-audit') {
  const result = await client.runWorkflow({
    name: 'security-audit-workflow',
    data: body
  });
  // 返回结果
}
```

## 📈 监控和日志

### 查看 Mastra 服务器日志

```bash
# 本地开发
npm run dev  # 控制台会显示详细日志

# 生产环境
# 查看你的服务器平台日志（Railway/Vercel/Docker）
```

### Cloudflare Workers 日志

```bash
# 实时查看 Worker 日志
wrangler tail

# 查看特定部署的日志
wrangler tail --env production
```

## 🔍 故障排除

### 常见问题

1. **MastraClient 连接失败**
   ```bash
   # 检查 MASTRA_BASE_URL 是否正确
   curl https://your-mastra-server.com/health
   ```

2. **Claude API 调用失败**
   ```bash
   # 检查 API Key 是否设置正确
   echo $ANTHROPIC_API_KEY
   ```

3. **Worker 部署失败**
   ```bash
   # 检查 wrangler.toml 配置
   wrangler whoami
   wrangler deploy --dry-run
   ```

## 🌟 最佳实践

### 1. **环境分离**
```bash
# 开发环境
MASTRA_BASE_URL=http://localhost:4111

# 测试环境  
MASTRA_BASE_URL=https://test-mastra-server.com

# 生产环境
MASTRA_BASE_URL=https://prod-mastra-server.com
```

### 2. **错误处理**
- 在 Worker 中实现重试逻辑
- 设置合理的超时时间
- 记录详细的错误日志

### 3. **性能优化**
- 使用 Mastra 的缓存功能
- 实现请求去重
- 监控响应时间

## 技术栈

- **Mastra Framework** - AI 代理和工作流管理
- **MastraClient** - 客户端连接库
- **Cloudflare Workers** - 边缘计算平台
- **Claude 3.5 Sonnet** - AI 模型
- **TypeScript** - 类型安全开发
- **Zod** - 运行时类型验证

## 贡献

欢迎提交 Pull Request 和 Issue！

## 许可证

ISC License