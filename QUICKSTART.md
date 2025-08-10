# 快速开始指南

## 🚀 5分钟快速部署 Mastra 代码审查服务

### 第一步：本地测试（1分钟）

```bash
# 1. 克隆项目
git clone https://github.com/limuran/mastra-codereview-agent.git
cd mastra-codereview-agent

# 2. 安装依赖
npm install

# 3. 设置环境变量
npm run setup:env
# 编辑 .env 文件，添加你的 ANTHROPIC_API_KEY

# 4. 启动 Mastra 服务器
npm run dev
```

在另一个终端测试：
```bash
# 测试本地服务
npm run test:api
```

### 第二步：部署 Mastra 服务器（2分钟）

#### 使用 Railway（推荐）

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录并部署
railway login
railway init
railway variables set ANTHROPIC_API_KEY=your-key-here
railway up

# 3. 获取部署URL
railway status
# 记录输出的 URL，如：https://your-project.railway.app
```

### 第三步：部署 Cloudflare Workers（2分钟）

```bash
# 1. 更新 wrangler.toml
# 编辑 wrangler.toml，将 MASTRA_BASE_URL 改为你的 Railway URL

# 2. 登录 Cloudflare 并部署
wrangler login
npm run deploy:worker

# 3. 测试完整系统
curl -X POST https://your-worker.workers.dev/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }",
    "language": "javascript"
  }'
```

## 🎯 验证部署成功

如果看到类似以下的响应，说明部署成功：

```json
{
  "success": true,
  "data": {
    "overall_rating": 8,
    "issues": [],
    "positive_aspects": [
      "Simple and clear function",
      "Good parameter naming"
    ],
    "summary": "Clean, simple function with no apparent issues"
  }
}
```

## 🔧 常用命令

```bash
# 查看 Mastra 服务器状态
npm run health:check

# 查看 Worker 日志
npm run logs:worker

# 重新部署 Worker
npm run deploy:worker

# 本地预览 Worker
npm run preview:worker
```

## 📱 集成示例

### JavaScript/Web 应用

```javascript
async function reviewCode(code, language) {
  const response = await fetch('https://your-worker.workers.dev/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language })
  });
  return await response.json();
}

// 使用示例
const result = await reviewCode('function test() { return 1; }', 'javascript');
console.log(result);
```

### Python 应用

```python
import requests

def review_code(code, language):
    response = requests.post(
        'https://your-worker.workers.dev/api/review',
        json={'code': code, 'language': language}
    )
    return response.json()

# 使用示例
result = review_code('def add(a, b): return a + b', 'python')
print(result)
```

### GitHub Actions

```yaml
name: Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Review Code
        run: |
          curl -X POST https://your-worker.workers.dev/api/review \
            -H "Content-Type: application/json" \
            -d '{"code": "${{ github.event.pull_request.body }}", "language": "javascript"}'
```

## 🎉 恭喜！

你现在有了一个完全运行的代码审查服务：

- ✅ **Mastra 服务器**：处理 AI 逻辑和工作流
- ✅ **Cloudflare Workers**：全球边缘计算节点
- ✅ **Claude API**：强大的代码分析能力
- ✅ **完整的 API**：可以集成到任何应用中

需要帮助？查看 [详细部署指南](docs/DEPLOYMENT.md) 或提交 Issue！