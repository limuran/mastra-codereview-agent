# Mastra Code Review Agent

一个基于 Mastra 和 Claude 的智能代码审查代理，提供两种部署模式：**Mastra 服务器模式**和**独立 Cloudflare Workers 模式**。

## 🚀 部署模式对比

### 模式 1: Mastra 服务器 + Cloudflare Workers
```
外部请求 → Cloudflare Workers → MastraClient → Mastra Server → Claude API
```
- ✅ 完整的 Mastra 功能（工作流、记忆、日志等）
- ✅ 适合复杂的 AI 应用
- ❌ 需要运行 Mastra 服务器

### 模式 2: 独立 Cloudflare Workers ⭐**推荐简单使用**
```
外部请求 → Cloudflare Workers → 直接调用 Claude API
```
- ✅ 完全无服务器，零维护
- ✅ 更快的响应速度
- ✅ 更低的复杂度和成本
- ❌ 不支持 Mastra 的高级功能

## 功能特性

- 🔍 智能代码分析和审查
- 🛡️ 安全漏洞检测
- ⚡ 性能优化建议
- 📝 代码质量评估
- 🚀 支持部署到 Cloudflare Workers
- 🤖 使用 Claude 3.5 Sonnet 模型

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

编辑 `.env` 文件，添加你的 Anthropic API Key：

```
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

## 🎯 推荐：独立模式部署（零服务器）

### 快速部署到 Cloudflare Workers

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 设置 API Key
wrangler secret put ANTHROPIC_API_KEY --config wrangler.standalone.toml

# 3. 部署
npm run deploy:standalone
```

### 测试独立部署

```bash
curl -X POST https://your-worker.workers.dev/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }",
    "language": "javascript",
    "filename": "math.js"
  }'
```

## 🔧 开发模式

### Mastra 开发模式

```bash
# 启动 Mastra 服务器
npm run dev

# 在另一个终端测试
curl -X POST http://localhost:4111/api/review \
  -H "Content-Type: application/json" \
  -d '{"code": "console.log(\"test\")", "language": "javascript"}'
```

### 独立模式本地测试

```bash
# 本地预览独立 Worker
npm run preview:standalone
```

## API 使用

### POST /api/review

审查代码的 API 端点。

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
        "description": "SQL injection vulnerability",
        "suggestion": "Use parameterized queries"
      }
    ],
    "positive_aspects": [
      "Clear variable naming",
      "Good function structure"
    ],
    "summary": "Code needs security improvements but has good structure"
  }
}
```

## 🏗️ 项目结构

```
src/
├── mastra/                    # Mastra 服务器模式
│   └── index.ts              # Mastra 实例定义
├── agents/                   # AI 代理定义
│   └── codeReviewer.ts
├── workflows/               # 工作流程定义
│   └── reviewWorkflow.ts
├── api/                     # API 处理程序 (MastraClient 模式)
│   └── review.ts
├── cloudflare/
│   ├── worker.ts            # Mastra 服务器模式的 Worker
│   └── standalone-worker.ts # 🌟 独立模式 Worker
└── index.ts                 # 主入口文件
```

## 📦 部署选项

### 选项 1: 独立模式（推荐）

```bash
# 配置文件: wrangler.standalone.toml
npm run deploy:standalone
```

**优点：**
- 零服务器维护
- 更快的冷启动
- 更低的成本
- 完全无状态

### 选项 2: Mastra 服务器模式

```bash
# 1. 启动 Mastra 服务器
npm run dev  # 或部署到服务器

# 2. 部署 Worker 连接到服务器
wrangler deploy  # 使用 wrangler.toml
```

**优点：**
- 完整的 Mastra 生态系统
- 支持复杂工作流
- 内置记忆和日志功能

## 💡 使用建议

### 🎯 什么时候选择独立模式：
- ✅ 只需要代码审查功能
- ✅ 希望零维护成本
- ✅ 对响应速度有要求
- ✅ 不需要复杂的工作流

### 🎯 什么时候选择 Mastra 模式：
- ✅ 需要构建复杂的 AI 应用
- ✅ 要使用多个 AI 代理
- ✅ 需要工作流编排
- ✅ 需要记忆和状态管理

## 🔧 自定义代码审查规则

### 独立模式

编辑 `src/cloudflare/standalone-worker.ts` 中的 prompt：

```typescript
let prompt = `你的自定义审查指令...`;
```

### Mastra 模式

编辑 `src/agents/codeReviewer.ts`：

```typescript
export const codeReviewAgent = new Agent({
  instructions: '你的自定义审查指令...'
});
```

## 实际使用示例

### GitHub Actions 集成

```yaml
# .github/workflows/code-review.yml
- name: Code Review
  run: |
    curl -X POST https://your-worker.workers.dev/api/review \
      -H "Content-Type: application/json" \
      -d "{\"code\": \"$(cat ${{ github.event.pull_request.diff_url }})\", \"language\": \"javascript\"}"
```

### 网页应用集成

```javascript
async function reviewMyCode(code) {
  const response = await fetch('https://your-worker.workers.dev/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language: 'javascript' })
  });
  return await response.json();
}
```

## 技术栈

- **独立模式**: Cloudflare Workers + AI SDK + Claude API
- **Mastra 模式**: Mastra Framework + MastraClient + Claude API
- **共同**: TypeScript + Zod + Claude 3.5 Sonnet

## 重要说明

1. **独立模式更适合大多数用户**: 如果你只需要代码审查功能，强烈推荐使用独立模式
2. **成本考虑**: 独立模式只产生 Cloudflare Workers 和 Claude API 的费用
3. **可扩展性**: 独立模式自动扩容，无需管理服务器

## 贡献

欢迎提交 Pull Request 和 Issue！

## 许可证

ISC License