# 部署指南

详细的 Mastra Code Review Agent 部署指南，采用 **Cloudflare Workers → MastraClient → Mastra Server → Claude API** 架构。

## 🏗️ 架构概览

```
┌─────────────────┐    ┌───────────────────┐    ┌──────────────────┐    ┌─────────────┐
│   用户请求      │───▶│ Cloudflare Workers │───▶│  Mastra Server   │───▶│ Claude API  │
│                 │    │  (Edge Computing)  │    │ (你的服务器)      │    │             │
└─────────────────┘    └───────────────────┘    └──────────────────┘    └─────────────┘
                                │                         │
                                │                         ▼
                                │                ┌─────────────────┐
                                │                │   数据库/存储    │
                                │                │ (记忆&日志)     │
                                │                └─────────────────┘
                                ▼
                       ┌─────────────────┐
                       │   全球CDN加速    │
                       │   自动扩容      │
                       └─────────────────┘
```

## 📋 部署步骤

### 第一阶段：准备工作

#### 1. 获取必要的 API Keys

```bash
# 1. Anthropic API Key
# 访问：https://console.anthropic.com/
# 创建 API Key

# 2. Cloudflare 账户
# 访问：https://dash.cloudflare.com/
# 获取 Account ID 和 API Token
```

#### 2. 克隆和配置项目

```bash
# 克隆项目
git clone https://github.com/limuran/mastra-codereview-agent.git
cd mastra-codereview-agent

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 必需配置
ANTHROPIC_API_KEY=sk-ant-xxx  # 你的 Anthropic API Key

# Mastra 服务器配置（稍后会更新）
MASTRA_BASE_URL=http://localhost:4111

# 可选：数据库配置（用于记忆功能）
# DATABASE_URL=postgresql://user:pass@host:port/db
```

### 第二阶段：部署 Mastra 服务器

选择以下任一平台部署 Mastra 服务器：

#### 选项 A：Railway（推荐，简单快速）

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录 Railway
railway login

# 3. 初始化项目
railway init
# 选择 "Deploy from GitHub repo"
# 连接你的 GitHub 仓库

# 4. 设置环境变量
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx
railway variables set NODE_ENV=production
railway variables set PORT=4111

# 5. 部署
railway up

# 6. 获取部署URL
railway status
# 记录下类似：https://your-project.railway.app 的 URL
```

#### 选项 B：Vercel

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 设置环境变量
vercel env add ANTHROPIC_API_KEY production
vercel env add NODE_ENV production

# 5. 重新部署以应用环境变量
vercel --prod
```

#### 选项 C：自建服务器（Docker）

创建 `Dockerfile`：
```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 4111

# 启动服务
CMD ["npm", "run", "start"]
```

部署命令：
```bash
# 构建镜像
docker build -t mastra-codereview .

# 运行容器
docker run -d \
  -p 4111:4111 \
  -e ANTHROPIC_API_KEY=sk-ant-xxx \
  -e NODE_ENV=production \
  --name mastra-server \
  mastra-codereview
```

#### 选项 D：使用 PM2（VPS/云服务器）

```bash
# 1. 在服务器上安装 PM2
npm install -g pm2

# 2. 上传代码到服务器
# 3. 安装依赖
npm install

# 4. 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mastra-codereview',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 4111,
      ANTHROPIC_API_KEY: 'sk-ant-xxx'  // 替换为你的 API Key
    }
  }]
}
EOF

# 5. 启动服务
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 第三阶段：验证 Mastra 服务器

```bash
# 测试服务器是否正常运行
curl https://your-mastra-server.com/health

# 预期响应：
# {"status":"healthy","timestamp":"2025-08-10T14:20:25.000Z"}

# 测试代码审查功能
curl -X POST https://your-mastra-server.com/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function test() { return 1; }",
    "language": "javascript"
  }'
```

### 第四阶段：部署 Cloudflare Workers

#### 1. 配置 Wrangler

编辑 `wrangler.toml`：
```toml
[env.production]
name = "mastra-codereview-agent"
compatibility_date = "2024-01-01"
node_compat = true

[vars]
# 替换为你的 Mastra 服务器地址
MASTRA_BASE_URL = "https://your-mastra-server.railway.app"
```

#### 2. 部署到 Cloudflare

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 验证配置
wrangler whoami

# 3. 测试部署（可选）
wrangler deploy --dry-run

# 4. 正式部署
wrangler deploy

# 5. 获取 Worker URL
# 输出类似：https://mastra-codereview-agent.your-subdomain.workers.dev
```

### 第五阶段：验证完整系统

```bash
# 测试完整的请求链路
curl -X POST https://your-worker.workers.dev/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function calculateSum(arr) { let sum = 0; for(let i = 0; i < arr.length; i++) { sum += arr[i]; } return sum; }",
    "language": "javascript",
    "filename": "utils.js",
    "context": "Array sum calculation utility function"
  }'
```

预期完整响应：
```json
{
  "success": true,
  "data": {
    "overall_rating": 7,
    "issues": [
      {
        "type": "performance",
        "severity": "low",
        "description": "Consider using reduce() method for better functional programming style",
        "suggestion": "return arr.reduce((sum, num) => sum + num, 0);"
      }
    ],
    "positive_aspects": [
      "Clear variable naming",
      "Simple and readable logic",
      "Proper loop structure"
    ],
    "summary": "Good basic implementation with opportunity for modern JavaScript improvements"
  }
}
```

## 🔧 高级配置

### 自定义域名（可选）

#### 1. 在 Cloudflare 中添加自定义域名

```bash
# 1. 在 Cloudflare Dashboard 中添加域名
# 2. 更新 wrangler.toml
cat >> wrangler.toml << 'EOF'

[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
EOF

# 3. 重新部署
wrangler deploy
```

### 环境分离

#### 开发环境配置
```toml
[env.development]
name = "mastra-codereview-dev"
vars = { MASTRA_BASE_URL = "http://localhost:4111" }
```

#### 测试环境配置
```toml
[env.staging]
name = "mastra-codereview-staging"
vars = { MASTRA_BASE_URL = "https://staging-mastra-server.com" }
```

#### 生产环境配置
```toml
[env.production]
name = "mastra-codereview-agent"
vars = { MASTRA_BASE_URL = "https://prod-mastra-server.com" }
```

部署到特定环境：
```bash
wrangler deploy --env development
wrangler deploy --env staging
wrangler deploy --env production
```

### 监控和日志

#### 1. Cloudflare Workers 监控

```bash
# 实时查看日志
wrangler tail

# 查看特定环境日志
wrangler tail --env production

# 查看性能指标
# 访问 Cloudflare Dashboard > Workers > Analytics
```

#### 2. Mastra 服务器监控

根据你选择的平台：

**Railway:**
```bash
# 查看日志
railway logs

# 查看资源使用
railway status
```

**Vercel:**
```bash
# 查看日志
vercel logs your-deployment-url

# 查看函数指标
# 访问 Vercel Dashboard > Functions
```

## 🚨 故障排除

### 常见问题及解决方案

#### 1. MastraClient 连接超时

**问题：** Worker 无法连接到 Mastra 服务器

**解决：**
```bash
# 检查服务器状态
curl https://your-mastra-server.com/health

# 检查 wrangler.toml 中的 MASTRA_BASE_URL
grep MASTRA_BASE_URL wrangler.toml

# 检查网络连通性
ping your-mastra-server.com
```

#### 2. Claude API 调用失败

**问题：** Anthropic API Key 无效或额度不足

**解决：**
```bash
# 验证 API Key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'

# 检查账户余额
# 访问 https://console.anthropic.com/settings/billing
```

#### 3. Worker 部署失败

**问题：** Cloudflare Workers 部署错误

**解决：**
```bash
# 检查 wrangler 配置
wrangler whoami
wrangler dev --local  # 本地测试

# 检查包大小（Workers 有大小限制）
npm run build
ls -la dist/

# 清理并重新部署
rm -rf node_modules
npm install
wrangler deploy
```

## 📊 性能优化

### 1. Mastra 服务器优化

```javascript
// 在 src/mastra/index.ts 中添加缓存配置
export const mastra = new Mastra({
  name: 'codereview-agent',
  agents: [codeReviewAgent],
  workflows: [codeReviewWorkflow],
  memory: {
    provider: 'upstash',  // 使用 Redis 缓存
    directives: ['Cache code review patterns for similar code']
  },
  logger: {
    provider: 'console',
    level: 'info'
  }
});
```

### 2. Cloudflare Workers 优化

```javascript
// 在 src/cloudflare/worker.ts 中添加缓存
export default {
  async fetch(request, env, ctx) {
    // 添加缓存逻辑
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    const response = await cache.match(cacheKey);
    
    if (response) {
      return response;
    }
    
    // 处理请求...
    const newResponse = await handleRequest(request);
    
    // 缓存响应（对于相同代码的审查结果）
    if (newResponse.status === 200) {
      ctx.waitUntil(cache.put(cacheKey, newResponse.clone()));
    }
    
    return newResponse;
  }
};
```

## 💰 成本估算

### Cloudflare Workers
- 免费额度：100,000 请求/天
- 超出后：$0.50/百万请求

### Mastra 服务器托管
- **Railway：** $5-20/月（根据资源使用）
- **Vercel：** 免费 - $20/月
- **自建 VPS：** $5-50/月

### Claude API
- 输入：$3/百万 tokens
- 输出：$15/百万 tokens
- 估算：每次代码审查约 0.001-0.01 美元

## 🔐 安全最佳实践

### 1. API Key 管理
```bash
# 使用 Cloudflare Workers Secrets
wrangler secret put ANTHROPIC_API_KEY

# 在服务器环境变量中存储，不要硬编码
```

### 2. 访问控制
```javascript
// 在 Worker 中添加简单的访问控制
if (!request.headers.get('Authorization')) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 3. 速率限制
```javascript
// 实现基本的速率限制
const clientId = request.headers.get('CF-Connecting-IP');
// 实现限制逻辑...
```

## 📈 扩展建议

### 1. 添加更多代理类型
- 安全审计代理
- 性能分析代理  
- 文档生成代理

### 2. 集成其他服务
- GitHub App 集成
- Slack 机器人
- VS Code 插件

### 3. 数据分析
- 代码质量趋势
- 常见问题统计
- 用户使用分析

现在你有了完整的部署指南！按照这个步骤，你就能成功部署基于 Mastra 架构的代码审查服务了。