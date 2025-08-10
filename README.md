# Mastra Code Review Agent

一个基于 Mastra 和 Claude 的智能代码审查代理，可部署到 Cloudflare Workers。

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

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 测试代码审查

项目启动后，你可以通过以下方式测试：

```typescript
import { reviewCode } from './src/index.js';

const result = await reviewCode({
  code: `
    function calculateTotal(items) {
      let total = 0;
      for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
      }
      return total;
    }
  `,
  language: 'javascript',
  filename: 'calculator.js'
});

console.log(result);
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
        "type": "performance",
        "severity": "medium",
        "line": 3,
        "description": "Consider using array methods instead of for loop",
        "suggestion": "Use reduce() for better readability"
      }
    ],
    "positive_aspects": [
      "Clear variable naming",
      "Simple and focused function"
    ],
    "summary": "Overall good code with minor optimization opportunities"
  }
}
```

## 部署到 Cloudflare Workers

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 设置环境变量

```bash
wrangler secret put ANTHROPIC_API_KEY
```

### 4. 部署

```bash
npm run build
wrangler deploy
```

## 项目结构

```
src/
├── mastra/           # Mastra 入口点（CLI 必需）
│   └── index.ts      # Mastra 实例定义
├── agents/           # AI 代理定义
│   └── codeReviewer.ts
├── workflows/        # 工作流程定义
│   └── reviewWorkflow.ts
├── api/             # API 处理程序 (使用 MastraClient)
│   └── review.ts
├── cloudflare/      # Cloudflare Workers 配置
│   └── worker.ts
└── index.ts         # 主入口文件
```

## 架构说明

### Mastra 实例 vs MastraClient

- **`src/mastra/index.ts`**: 定义 Mastra 实例，供 CLI 使用
- **`src/api/review.ts`**: 使用 `MastraClient` 调用工作流程
- **双重架构**: 满足 Mastra CLI 要求同时支持客户端调用

```typescript
// Mastra 实例 (for CLI)
export const mastra = new Mastra({
  name: 'codereview-agent',
  agents: [codeReviewAgent],
  workflows: [codeReviewWorkflow]
});

// MastraClient (for API calls)
const client = new MastraClient({
  baseUrl: process.env.MASTRA_BASE_URL || 'http://localhost:4111'
});
```

## 依赖版本

```json
{
  "@mastra/client-js": "0.10.20",
  "@mastra/deployer-cloudflare": "0.11.5",
  "@mastra/core": "^0.13.1"
}
```

## 配置

### 代理配置

在 `src/agents/codeReviewer.ts` 中自定义代码审查规则：

```typescript
export const codeReviewAgent = new Agent({
  name: 'code-reviewer',
  instructions: '你的自定义代码审查指令...',
  model: anthropic('claude-3-5-sonnet-20241022'),
  outputSchema: CodeReviewSchema
});
```

### 工作流配置

在 `src/workflows/reviewWorkflow.ts` 中定义审查流程。

## 开发

### 添加新的代码审查规则

在 `src/agents/codeReviewer.ts` 中修改 agent 的指令。

### 自定义工作流

在 `src/workflows/` 中创建新的工作流程。

### 添加新的 API 端点

在 `src/api/` 中添加新的处理器，使用 `MastraClient` 进行调用。

## 使用示例

### cURL 测试

```bash
curl -X POST http://localhost:4111/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }",
    "language": "javascript",
    "filename": "math.js"
  }'
```

### JavaScript 调用

```javascript
const response = await fetch('/api/review', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'def add(a, b): return a + b',
    language: 'python',
    filename: 'math.py'
  })
});

const result = await response.json();
console.log(result);
```

## 技术栈

- **Mastra Framework** - AI 代理和工作流管理
- **MastraClient** - 客户端调用接口
- **Claude 3.5 Sonnet** - 强大的代码审查 AI 模型  
- **TypeScript** - 类型安全的开发体验
- **Cloudflare Workers** - 无服务器部署平台
- **Zod** - 运行时类型验证

## 重要说明

1. **入口文件位置**: Mastra CLI 要求入口文件必须位于 `src/mastra/index.ts`
2. **双重架构**: 项目同时支持 Mastra 实例（CLI）和 MastraClient（API 调用）
3. **版本兼容**: 使用指定版本的 `@mastra/client-js` 和 `@mastra/deployer-cloudflare`

## 贡献

欢迎提交 Pull Request 和 Issue！

## 许可证

ISC License