import React, { useState, useEffect, useMemo } from 'react';
import { fetchWages } from './services/wageService';
import { useFeishuAuth } from './hooks/useFeishuAuth';
import { LoginLoading } from './components/LoginLoading';

// --- 1. 模拟 Mock API ---
// 已迁移至 services/wageService.js

// --- 2. 辅助工具函数 ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const formatDateKey = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// --- 3. 组件部分 ---
function App() {
  // 飞书认证
  const { user: authUser, loading: authLoading, error: authError } = useFeishuAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ userName: '', records: [] });
  // 默认查看2023年12月
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));

  useEffect(() => {
    // 等待认证完成
    if (authLoading) return;

    // 认证失败
    if (authError || !authUser) {
      setLoading(false);
      return;
    }

    const userName = authUser.name || authUser.en_name;

    if (!userName) {
      console.error('Missing userName from auth');
      setLoading(false);
      setData(prev => ({ ...prev, userName: '' }));
      return;
    }

    console.log('Fetching wages for:', userName);
    fetchWages(userName).then((data) => {
      setData(data);
      setLoading(false);
    }).catch((error) => {
      console.error("Failed to load wages:", error);
      setLoading(false);
    });
  }, [authUser, authLoading, authError]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { daysArray, monthlyTotal } = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const wageMap = {};
    let total = 0;

    data.records.forEach(item => {
      const wage = item.wage == null ? 0 : Number(item.wage) || 0;
      wageMap[item.date] = wage;
      const [rYear, rMonth] = item.date.split('-').map(Number);
      if (rYear === year && rMonth === month + 1) {
        total += wage;
      }
    });

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateKey = formatDateKey(year, month, day);
      return {
        day,
        dateKey,
        wage: wageMap[dateKey] || 0
      };
    });

    return { daysArray: [...blanks, ...days], monthlyTotal: total };
  }, [currentDate, data]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  // 显示认证/加载状态
  if (authLoading || loading) {
    return <LoginLoading error={authError} />;
  }

  // 认证错误
  if (authError) {
    return <LoginLoading error={authError} />;
  }

  return (
    <div style={styles.container}>
      {/* 顶部：用户信息与汇总 */}
      <div style={styles.headerCard}>
        <h2 style={styles.userName}>{data.userName} 的工资单</h2>
        <div style={styles.totalContainer}>
          <span style={styles.totalLabel}>{year}年{month + 1}月 总收入</span>
          <span style={styles.totalAmount}>¥ {monthlyTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* 控制条：切换月份 */}
      <div style={styles.controlBar}>
        <button onClick={() => changeMonth(-1)} style={styles.navBtn}>&lt; 上月</button>
        <span style={styles.currentDateDisplay}>{year}年 {month + 1}月</span>
        <button onClick={() => changeMonth(1)} style={styles.navBtn}>下月 &gt;</button>
      </div>

      {/* 日历主体 */}
      <div style={styles.calendar}>
        <div style={styles.weekRow}>
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} style={styles.weekCell}>{d}</div>
          ))}
        </div>

        <div style={styles.daysGrid}>
          {daysArray.map((item, index) => {
            if (!item) return <div key={`blank-${index}`} style={styles.dayCellEmpty} />;

            const hasWage = item.wage > 0;
            return (
              <div key={item.day} style={styles.dayCell}>
                <span style={styles.dayNumber}>{item.day}</span>
                {hasWage ? (
                  <span style={styles.wageAmount}>+{item.wage}</span>
                ) : (
                  <span style={styles.noWage}>-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- 4. 样式 ---
const styles = {
  container: {
    maxWidth: '480px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    padding: '16px',
    boxSizing: 'border-box',
  },
  loading: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    borderRadius: '16px', padding: '20px', color: 'white',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', marginBottom: '20px',
  },
  userName: { margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'normal', opacity: 0.9 },
  totalContainer: { display: 'flex', flexDirection: 'column' },
  totalLabel: { fontSize: '14px', opacity: 0.8, marginBottom: '4px' },
  totalAmount: { fontSize: '32px', fontWeight: 'bold' },
  controlBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px', padding: '0 8px',
  },
  navBtn: {
    background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
    padding: '8px 16px', fontSize: '14px', color: '#374151', cursor: 'pointer',
  },
  currentDateDisplay: { fontSize: '18px', fontWeight: '600', color: '#1f2937' },
  calendar: {
    backgroundColor: 'white', borderRadius: '16px', padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' },
  weekCell: { textAlign: 'center', fontSize: '14px', color: '#9ca3af', paddingBottom: '8px' },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
  dayCell: {
    aspectRatio: '1', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb',
    borderRadius: '8px', border: '1px solid #f3f4f6',
  },
  dayCellEmpty: { aspectRatio: '1' },
  dayNumber: { fontSize: '14px', color: '#374151', fontWeight: '500', marginBottom: '2px' },
  wageAmount: { fontSize: '12px', color: '#10b981', fontWeight: '600' },
  noWage: { fontSize: '12px', color: '#d1d5db' }
};

export default App;