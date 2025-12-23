/**
 * 飞书 API 服务
 * 封装与后端 API 的通信
 */

/**
 * 获取飞书应用 ID
 */
export async function getAppId() {
    const response = await fetch('/api/get_appid');
    if (!response.ok) {
        throw new Error('Failed to get app id');
    }
    const data = await response.json();
    return data.appid;
}

/**
 * 用授权码换取用户信息
 * @param {string} code - 飞书授权码
 */
export async function getUserInfoByCode(code) {
    const response = await fetch(`/api/callback?code=${encodeURIComponent(code)}`);
    if (!response.ok) {
        throw new Error('Failed to get user info');
    }
    return response.json();
}
