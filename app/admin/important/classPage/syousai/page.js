"use client"
import styles from './page.module.css'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClassPage() {
    const router = useRouter();

    useEffect(() => {
        // localStorage から role を取得
        // 管理者ログイン時は "admin" を保存している前提
        const role = localStorage.getItem("role");

        // role が admin でなければアクセス不可
        if (role !== "admin") {
            alert("管理者ログインが必要です"); // 警告メッセージ
            router.push("/admin"); // 管理者ログインページへリダイレクト
        }
    }, []);

    // 月ボタンクリックで出席ページに遷移する関数
    const goToMonth = (studentId, month) => {
        router.push(`/admin/important/classPage/syousai/attendance_situation?studentId=${studentId}&month=${month}`);
    };

    const studentId = "s23022"; // 仮。DBから動的に取得可能

    // 仮データ：月ごとの遅刻回数と出席コマ数
    const monthSummary = {
        "04": { late: 2, attendedKoma: 23, totalKoma: 24 },
        "05": { late: 1, attendedKoma: 20, totalKoma: 22 },
        "06": { late: 0, attendedKoma: 25, totalKoma: 25 },
        "07": { late: 3, attendedKoma: 18, totalKoma: 24 },
        "08": { late: 0, attendedKoma: 22, totalKoma: 22 },
        "09": { late: 1, attendedKoma: 21, totalKoma: 24 },
        "10": { late: 0, attendedKoma: 20, totalKoma: 20 },
        "11": { late: 2, attendedKoma: 18, totalKoma: 20 },
        "12": { late: 0, attendedKoma: 22, totalKoma: 22 },
        "01": { late: 1, attendedKoma: 21, totalKoma: 24 },
        "02": { late: 0, attendedKoma: 23, totalKoma: 24 },
        "03": { late: 2, attendedKoma: 19, totalKoma: 24 },
    };

    return (
        <main className={styles.Main}>
            <div className={styles.matome}>
                <h1 className={styles.students_ID}>{studentId}</h1>
                <ul className={styles.jouhou}>
                    <li className={styles.jouhou_01}>ID：{studentId}</li>
                    <li className={styles.jouhou_01}>名前：{""}</li>
                    <li className={styles.jouhou_01}>email：{""}</li>
                    <li className={styles.jouhou_01}>password：{""}</li>
                </ul>

                {/* 月ボタン 1〜6月 */}
                <div className={styles.M01_M06_button_summary}>
                    {["04","05","06","07","08","09"].map((m) => (
                        <div key={m} className={styles.month_block}>
                            <button
                                className={styles.M01_06_button}
                                onClick={() => goToMonth(studentId, m)}
                            >
                                {parseInt(m)}月
                            </button>
                            <p className={styles.behind_time_text}>
                                遅刻：{monthSummary[m].late}回　　　コマ：{monthSummary[m].attendedKoma}/{monthSummary[m].totalKoma}
                            </p>
                        </div>
                    ))}
                </div>

                {/* 月ボタン 7〜12月 */}
                <div className={styles.M07_M12_button_summary}>
                    {["10","11","12","01","02","03"].map((m) => (
                        <div key={m} className={styles.month_block}>
                            <button
                                className={styles.M07_12_button}
                                onClick={() => goToMonth(studentId, m)}
                            >
                                {parseInt(m)}月
                            </button>
                            <p className={styles.behind_time_text}>
                                遅刻：{monthSummary[m].late}回　　　コマ：{monthSummary[m].attendedKoma}/{monthSummary[m].totalKoma}
                            </p>
                        </div>
                    ))}
                </div>

                <button className={styles.return_button} onClick={() => router.push("/admin/important/classPage")}>戻る</button>
                <button className={styles.deth}>削除</button>
            </div>
        </main>
    )
}
