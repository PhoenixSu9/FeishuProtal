/**
 * 飞书认证 Hook
 * 自动处理飞书免登流程
 */
import { useState, useEffect } from 'react';
import { getAppId, getUserInfoByCode } from '../services/feishuService';

/**
 * 飞书认证状态
 * @typedef {Object} FeishuAuthState
 * @property {Object|null} user - 用户信息
 * @property {boolean} loading - 是否正在加载
 * @property {string|null} error - 错误信息
 */

/**
 * 飞书认证 Hook
 * @returns {FeishuAuthState}
 */
export function useFeishuAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 如果 URL 中已有 name 参数，直接使用（兼容旧逻辑）
        const urlParams = new URLSearchParams(window.location.search);
        const nameFromUrl = urlParams.get('name');
        if (nameFromUrl) {
            console.log('Using name from URL:', nameFromUrl);
            setUser({ name: decodeURIComponent(nameFromUrl) });
            setLoading(false);
            return;
        }

        // 检测是否在飞书环境
        if (!window.h5sdk) {
            console.log('Not in Feishu environment, using mock user');
            // 开发环境模拟用户
            if (import.meta.env.DEV) {
                setUser({ name: '测试用户', mobile: '13800138000' });
                setLoading(false);
                return;
            }
            setError('请在飞书中打开此应用');
            setLoading(false);
            return;
        }

        // 飞书免登流程
        doFeishuAuth();
    }, []);

    async function doFeishuAuth() {
        try {
            // 1. 获取 app_id
            const appId = await getAppId();
            console.log('Got app_id:', appId);

            // 2. 设置错误处理
            window.h5sdk.error((err) => {
                console.error('h5sdk error:', err);
                setError('飞书 SDK 错误: ' + JSON.stringify(err));
                setLoading(false);
            });

            // 3. 等待 SDK 就绪
            window.h5sdk.ready(() => {
                console.log('h5sdk ready');

                // 4. 请求授权
                window.tt.requestAccess({
                    appID: appId,
                    scopeList: [],
                    success: async (res) => {
                        console.log('Got authorization code');
                        try {
                            // 5. 用 code 换取用户信息
                            const userInfo = await getUserInfoByCode(res.code);
                            console.log('Got user info:', userInfo.name);
                            setUser(userInfo);
                        } catch (err) {
                            console.error('Failed to get user info:', err);
                            setError('获取用户信息失败');
                        }
                        setLoading(false);
                    },
                    fail: (err) => {
                        console.error('requestAccess failed:', err);
                        setError('授权失败: ' + JSON.stringify(err));
                        setLoading(false);
                    },
                });
            });
        } catch (err) {
            console.error('Feishu auth error:', err);
            setError('认证失败: ' + err.message);
            setLoading(false);
        }
    }

    return { user, loading, error };
}
