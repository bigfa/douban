# 自动同步豆瓣书影音记录

## Docker Compose 构建

### Mac 用户

```
brew install docker docker-compose
```

### Window 用户

```
choco install docker-desktop docker-compose -y

```

创建一个`docker-compose.yml`文件，示例

```
version: '3'
services:
  douban-docker:
    image: douban-docker/latest
    container_name: douban-docker
    volumes:
      - assets:/app/static
    environment:
      MONGO_URI: mongodb://mongo:27017/fatesinger
      DBID: 54529369
      DOMAIN: https://node.wpista.com
    depends_on:
      - mongo
    ports:
      - 8000:3000
    networks:
      - shared-network

  mongo:
    image: mongo:4.4.29
    container_name: mongo
    restart: "always"
    volumes:
      # Persist mongodb data
      - database:/data/db

    ports:
      - "27017:27017"

    networks:
      - shared-network

volumes:
  assets:
    driver: local
    name: assets

  database:
    driver: local
    name: mongodb_data

networks:
  shared-network:
```

Nignx 配置

```
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST $remote_addr;
  }
}
```

运行

```
docker-compose up -d
```

## 自动同步

添加定时任务，每半小时同步一次。

```
*/30 * * * * curl -—silent "http://localhost:8000/api/sync" >/dev/null 2>&1
```

## 配置参数

MONGO_URI

DBID 你的豆瓣 ID

DOMAIN 绑定的域名

## 本地开发

根据`.env.example`创建`.env`文件

```
npm install
npm run dev
```

> 需要本地有 mongodb 服务
