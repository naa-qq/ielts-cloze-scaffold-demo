# IELTS Cloze Practice - 项目骨架

功能简介
- 管理后台（简单）批量导入句子（JSON）
- 练习页：播放整句，显示挖空句（cloze），输入填写，提交判分
- 错题本：记录每次练习，按错题频率排序
- 使用 Prisma + PostgreSQL 存储数据
- 使用浏览器 Web Speech API 做 TTS（可替换为服务端 TTS）

快速启动
1. 安装依赖
   npm install

2. 配置环境变量
   复制 `.env.example` 为 `.env`，并填入你的 `DATABASE_URL` （Postgres）

3. 初始化数据库
   npx prisma migrate dev --name init
   npx prisma generate

4. 可选：运行 seed 插入示例数据
   node prisma/seed.js

5. 启动开发服务器
   npm run dev

主要页面
- /              首页
- /admin/import  管理导入页（粘贴 JSON 批量导入）
- /practice      听写/练习页
- /wronglist     错题本

导入 JSON 格式示例
[
  {
    "externalId": "s001",
    "sentence": "The research indicates a significant increase in renewable energy usage.",
    "targetWord": "increase",
    "occurrenceIndex": 1,
    "translation": "增加",
    "tags": ["ielts","energy"]
  }
]

后续可扩展
- 用户认证（NextAuth）
- 服务端 TTS（Google/AWS/Azure 或开源 TTS），并缓存 audio_url
- 更完善的判分（词形还原、容错配置）、SM-2 复习算法
