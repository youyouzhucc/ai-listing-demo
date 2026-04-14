# AI 快速挂售 Demo

Vite + React + TypeScript + Tailwind + `lucide-react`。

## 阿里云一键部署

```bash
cp .env.deploy.example .env.deploy
# 编辑 .env.deploy：选 oss 或 ssh，填 AccessKey / 服务器等

npm run deploy
```

脚本会先 `npm install` 与 `npm run build`，再按 `DEPLOY_TARGET` 同步 `dist/`。变量说明见 `.env.deploy.example`。

## ECS 上一键部署（对齐 `deploy-curabot`）

在阿里云 ECS 上进入克隆目录后，流程与 CuraBot 类似：**备份 `.env` → `git pull` → `npm install` → `npm run build` → `pm2 restart` → `pm2 save` → `curl` 探测**。

```bash
# 首次：安装 pm2（若尚未全局安装）
npm i -g pm2

# 首次：配置开机自启（只需一次）
pm2 startup   # 按提示执行输出的 sudo 命令

# 每次发版（含首次：会 startOrReload ecosystem）
npm run deploy:ecs
# 或：bash scripts/deploy-ecs.sh
```

可选环境变量（与 `deploy-curabot` 一样可写进 `~/.bashrc` 或脚本前 `export`）：

| 变量 | 默认 | 说明 |
|------|------|------|
| `PM2_APP_NAME` | `ai-listing-demo` | PM2 进程名 |
| `GIT_BRANCH` | `main` | `git pull` 分支 |
| `PORT` | `4173` | `serve` 监听端口（需与 `HEALTHCHECK_URL` 一致） |
| `HEALTHCHECK_URL` | `http://127.0.0.1:4173/` | 部署后探测地址 |

本仓库无 `knowledge.json` 校验；改为校验 **`dist/index.html`** 是否存在。对外访问建议在前面加 **Nginx 反代** 到 `127.0.0.1:4173`，并配置 HTTPS。

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
