/**
 * 登录加载页组件
 * 显示登录过程中的加载状态
 */
import React from 'react';

const styles = {
    page: {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px',
        textAlign: 'center',
    },
    badge: {
        fontSize: '12px',
        background: 'rgba(255,255,255,0.1)',
        padding: '4px 12px',
        borderRadius: '20px',
        marginBottom: '20px',
        letterSpacing: '2px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '14px',
        opacity: 0.7,
        marginBottom: '40px',
    },
    progressContainer: {
        width: '200px',
        height: '4px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '16px',
    },
    progressBar: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
        animation: 'loading 1.5s ease-in-out infinite',
    },
    hint: {
        fontSize: '12px',
        opacity: 0.5,
    },
    error: {
        color: '#f87171',
        fontSize: '14px',
        marginTop: '20px',
        padding: '12px 24px',
        background: 'rgba(248, 113, 113, 0.1)',
        borderRadius: '8px',
    },
    footer: {
        position: 'absolute',
        bottom: '20px',
        fontSize: '12px',
        opacity: 0.3,
    },
};

// CSS 动画需要通过 style 标签注入
const keyframes = `
  @keyframes loading {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0); }
    100% { transform: translateX(100%); }
  }
`;

export function LoginLoading({ error = null }) {
    return (
        <div style={styles.page}>
            <style>{keyframes}</style>
            {/* <div style={styles.badge}>Tianjie</div> */}
            <div style={styles.title}>工资单</div>
            <div style={styles.subtitle}>
                {error ? '登录失败' : '正在为您验证身份'}
            </div>

            {!error && (
                <>
                    <div style={styles.progressContainer}>
                        <div style={styles.progressBar} />
                    </div>
                    <div style={styles.hint}>请稍候</div>
                </>
            )}

            {error && <div style={styles.error}>{error}</div>}
        </div>
    );
}

export default LoginLoading;
