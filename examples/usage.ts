import { reviewCode } from '../src/index.js';

// 示例 1: 审查 JavaScript 函数
async function example1() {
  const result = await reviewCode({
    code: `
function getUserData(userId) {
  const user = database.query('SELECT * FROM users WHERE id = ' + userId);
  return user;
}
    `,
    language: 'javascript',
    filename: 'user.js',
    context: '用户数据获取函数'
  });
  
  console.log('JavaScript 审查结果:', result);
}

// 示例 2: 审查 Python 代码
async function example2() {
  const result = await reviewCode({
    code: `
def process_payments(payments):
    total = 0
    for payment in payments:
        if payment['amount'] > 0:
            total += payment['amount']
    return total
    `,
    language: 'python',
    filename: 'payments.py',
    context: '支付处理函数'
  });
  
  console.log('Python 审查结果:', result);
}

// 示例 3: 审查 React 组件
async function example3() {
  const result = await reviewCode({
    code: `
import React, { useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  React.useEffect(() => {
    fetch('/api/users/' + userId)
      .then(res => res.json())
      .then(setUser);
  }, []);
  
  return (
    <div>
      {user ? <h1>{user.name}</h1> : <p>Loading...</p>}
    </div>
  );
}
    `,
    language: 'typescript',
    filename: 'UserProfile.tsx',
    context: 'React 用户资料组件'
  });
  
  console.log('React 组件审查结果:', result);
}

// 运行所有示例
async function runExamples() {
  console.log('=== Mastra 代码审查代理示例 ===\n');
  
  await example1();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await example2();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await example3();
}

runExamples().catch(console.error);