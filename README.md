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
├── agents/           # AI 代理定义
│   └── codeReviewer.ts
├── workflows/        # 工作流程定义
│   └── reviewWorkflow.ts
├── api/             # API 处理程序
│   └── review.ts
├── cloudflare/      # Cloudflare Workers 配置
│   └── worker.ts
└── index.ts         # 主入口文件
```

## 配置

主要配置在 `mastra.config.ts` 中：

- **Agent**: 配置 Claude 模型和指令
- **Memory**: 配置记忆提供者
- **Logger**: 配置日志级别

## 开发

### 添加新的代码审查规则

在 `src/agents/codeReviewer.ts` 中修改 agent 的指令：

```typescript
instructions: `你的自定义代码审查指令...`
```

### 自定义工作流

在 `src/workflows/` 中创建新的工作流程。

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

- **Mastra**: AI 代理框架
- **Claude 3.5 Sonnet**: AI 模型
- **TypeScript**: 开发语言
- **Cloudflare Workers**: 部署平台
- **Zod**: 数据验证

## 贡献

欢迎提交 Pull Request 和 Issue！

## 许可证

ISC License