# Douban Docker API 说明（中文）

## 1. 服务说明

这是一个用于同步和查询豆瓣书影音记录的 HTTP 服务。  
数据来源为豆瓣接口，数据缓存到 MongoDB，封面图片会落地到本地 `static` 目录。

## 2. 环境变量

| 变量名 | 说明 | 默认值 |
| --- | --- | --- |
| `MONGO_URI` | MongoDB 连接串 | `mongodb://localhost:27017/douban` |
| `DBID` | 豆瓣用户 ID | `54529369` |
| `DOMAIN` | 对外访问域名，用于拼接封面 URL | `http://localhost:3000` |
| `PORT` | 服务端口 | `3000` |
| `API_BASE` | API 路由前缀 | `/` |

说明：  
- 默认 `API_BASE=/`，接口路径直接是 `/list`、`/sync` 等。  
- 如果配置 `API_BASE=/api`，接口会变为 `/api/list`、`/api/sync` 等。

## 3. 基础地址

- 本地默认：`http://localhost:3000`
- 生产环境：`https://你的域名`

## 4. 接口列表

### 4.1 获取条目列表

- 方法：`GET`
- 路径：`/list`
- 参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `type` | string | 否 | `movie` | 条目类型：`movie`、`book`、`music`、`game`、`drama` |
| `status` | string | 否 | `done` | 状态：`done`、`mark`、`doing` |
| `paged` | number | 否 | `1` | 页码，按每页 20 条分页 |

- 响应示例：

```json
{
  "results": [
    {
      "subject_id": "1292052",
      "name": "肖申克的救赎",
      "card_subtitle": "The Shawshank Redemption",
      "create_time": "2024-05-21T10:11:12.000Z",
      "douban_score": "9.7",
      "link": "https://movie.douban.com/subject/1292052/",
      "type": "movie",
      "poster": "http://localhost:3000/static/movie/1292052.jpg",
      "pubdate": "1994-09-10",
      "year": "1994",
      "status": "done"
    }
  ]
}
```

### 4.2 获取单个条目

- 方法：`GET`
- 路径：`/:type/:id`
- 路径参数：

| 参数 | 说明 |
| --- | --- |
| `type` | 条目类型：`movie`、`book`、`music`、`game`、`drama` |
| `id` | 豆瓣条目 ID |

- 响应示例：

```json
{
  "subject_id": "1292052",
  "name": "肖申克的救赎",
  "card_subtitle": "The Shawshank Redemption",
  "create_time": "2024-05-21T10:11:12.000Z",
  "douban_score": "9.7",
  "link": "https://movie.douban.com/subject/1292052/",
  "type": "movie",
  "poster": "http://localhost:3000/movie/1292052.jpg",
  "pubdate": "1994-09-10",
  "year": "1994",
  "status": "done"
}
```

### 4.3 获取本地封面图片

- 方法：`GET`
- 路径：`/:type/:id.jpg`
- 返回：`image/jpeg`
- 响应头：
  - `Cache-Control: max-age=31536000`
  - `ETag: <hash>`

说明：  
如果本地不存在该图片，会先回源下载，再返回图片内容。

### 4.4 触发同步

- 方法：`GET`
- 路径：`/sync`
- 参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `types` | string | 否 | `movie,book,music,game,drama` | 要同步的类型，逗号分隔 |
| `statuses` | string | 否 | `done,mark,doing` | 要同步的状态，逗号分隔 |

- 响应示例：

```text
finish sync
```

## 5. 错误响应

当发生异常时，响应为 JSON：

```json
{
  "success": false,
  "message": "错误信息",
  "stack": "开发环境下可见"
}
```

## 6. curl 示例

```bash
# 列表
curl "http://localhost:3000/list?type=movie&status=done&paged=1"

# 单个条目
curl "http://localhost:3000/movie/1292052"

# 本地封面
curl "http://localhost:3000/movie/1292052.jpg" --output cover.jpg

# 手动同步
curl "http://localhost:3000/sync?types=movie,book&statuses=done,doing"
```

## 7. 封面本地化与缓存机制

1. 列表和单条接口会触发封面检查。  
2. 本地无封面时会下载并写入 `static/<type>/<id>.jpg`。  
3. 下次请求优先走本地文件，减少外部请求开销。  
