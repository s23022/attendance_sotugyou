import styles from './page.module.css'
import {useEffect, useState} from "react";

export default function Days() {
    // ==========================
    // 今日の日付情報
    // ==========================
    const [today, setToday] = useState(null);
    useEffect(() => setToday(new Date()), []);
    return (
        <>
            {/* 今日の日付表示 */}
            <div className={styles.title}>出席管理</div>
            {
                today && (
                    <div className={styles.date}>
                        {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日(
                        {["日", "月", "火", "水", "木", "金", "土"][today.getDay()]}
                        )
                    </div>
                )
            }
        </>
    )
}