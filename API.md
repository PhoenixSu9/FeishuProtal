# 工资单接口文档

## 获取工资单数据

获取用户的工资单记录，包括用户名和每日工资明细。

- **URL**: `/api/wages`
- **Method**: `GET`
- **Content-Type**: `application/json`

### 请求参数 (Query Parameters)

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| year | number | 否 | 查询年份 (例如: 2023) |
| month | number | 否 | 查询月份 (1-12) |

*(注：如果不传年份和月份，默认返回最近的数据或所有数据，具体视后端实现而定)*

### 响应体 (Response Body)

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userName": "张三",
    "records": [
      {
        "date": "2023-10-01",
        "amount": 300
      },
      {
        "date": "2023-12-25",
        "amount": 800
      }
    ]
  }
}
```

### 字段说明

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| code | number | 状态码，200表示成功 |
| message | string | 状态信息 |
| data | object | 数据主体 |
| data.userName | string | 用户姓名 |
| data.records | array | 工资记录列表 |
| data.records[].date | string | 日期，格式 `YYYY-MM-DD` |
| data.records[].amount | number | 金额 |

### 错误响应示例

```json
{
  "code": 500,
  "message": "Internal Server Error"
}
```
