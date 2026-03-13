# 三国大富翁后端 Dockerfile - 使用预装 node_modules
FROM node:20-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 复制预装的 node_modules
COPY node_modules/ ./node_modules/

# 复制编译好的代码
COPY dist/ ./dist/

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "dist/index.js"]
