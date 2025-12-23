/**
 * Express 后端服务器
 * 处理飞书登录认证 API
 */
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 4000;

// 飞书应用配置
const APP_ID = '';
const APP_SECRET = '';

// 缓存 token
let appAccessToken = null;
let tokenFetchTime = 0;

app.use(cors());
app.use(express.json());

/**
 * 检查 token 是否过期 (1.5小时)
 */
function isTokenExpired() {
    return Date.now() - tokenFetchTime > 1.5 * 60 * 60 * 1000;
}

/**
 * 获取 app_access_token
 */
async function getAppAccessToken() {
    if (appAccessToken && !isTokenExpired()) {
        return appAccessToken;
    }

    const response = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal',
        {
            app_id: APP_ID,
            app_secret: APP_SECRET,
        }
    );

    appAccessToken = response.data.app_access_token;
    tokenFetchTime = Date.now();
    return appAccessToken;
}

/**
 * 获取 tenant_access_token
 */
async function getTenantAccessToken() {
    const response = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
            app_id: APP_ID,
            app_secret: APP_SECRET,
        }
    );
    return response.data.tenant_access_token;
}

/**
 * 用 code 换取 user_access_token
 */
async function getUserAccessToken(code) {
    const appToken = await getAppAccessToken();

    const response = await axios.post(
        'https://open.feishu.cn/open-apis/authen/v1/access_token',
        {
            grant_type: 'authorization_code',
            code: code,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${appToken}`,
            },
        }
    );

    return response.data.data.access_token;
}

/**
 * 获取用户信息
 */
async function getUserInfo(userAccessToken) {
    const response = await axios.get(
        'https://open.feishu.cn/open-apis/authen/v1/user_info',
        {
            headers: {
                Authorization: `Bearer ${userAccessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data.data;
}

/**
 * 根据 open_id 获取用户手机号
 */
async function getUserPhone(openId) {
    const tenantToken = await getTenantAccessToken();

    const response = await axios.get(
        `https://open.feishu.cn/open-apis/contact/v3/users/${openId}?user_id_type=open_id`,
        {
            headers: {
                Authorization: `Bearer ${tenantToken}`,
            },
        }
    );

    return response.data?.data?.user?.mobile || '';
}

// ==================== API 路由 ====================

/**
 * GET /api/get_appid
 * 返回飞书应用 ID
 */
app.get('/api/get_appid', (req, res) => {
    res.json({ appid: APP_ID });
});

/**
 * GET /api/callback?code=xxx
 * 用授权码换取用户信息
 */
app.get('/api/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: 'Missing code parameter' });
        }

        // 1. 用 code 换取 user_access_token
        const userAccessToken = await getUserAccessToken(code);

        // 2. 获取用户基本信息
        const userInfo = await getUserInfo(userAccessToken);

        // 3. 获取用户手机号
        const phone = await getUserPhone(userInfo.open_id);
        userInfo.mobile = phone;

        console.log('User authenticated:', userInfo.name);
        res.json(userInfo);
    } catch (error) {
        console.error('Callback error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
});

/**
 * 健康检查
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 API Server running at http://localhost:${PORT}`);
    console.log(`   - GET /api/get_appid`);
    console.log(`   - GET /api/callback?code=xxx`);
});
