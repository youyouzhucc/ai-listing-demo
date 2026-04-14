/**
 * PM2：托管构建后的静态站点（serve SPA）
 * 首次：在项目根执行 pm2 start ecosystem.config.cjs && pm2 save
 */
const path = require('node:path')
const root = __dirname
const port = process.env.PORT || '4173'

module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'ai-listing-demo',
      cwd: root,
      script: path.join(root, 'node_modules/.bin/serve'),
      args: ['-s', 'dist', '-l', port],
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      max_memory_restart: '200M',
    },
  ],
}
