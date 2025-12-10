"use client";

import styles from "./page.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClassPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 一覧ページから渡された値
    const studentId = searchParams.get("studentId");       // ← student_id
    const table = searchParams.get("table");               // ← 例: s3
    const month = searchParams.get("month");

    const [student, setStudent] = useState(null);

    // ------------------------------
    // 管理者チェック
    // ------------------------------
    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            alert("管理者ログインが必要です");
            router.push("/admin");
        }
    }, [router]);

    // ------------------------------
    // 生徒の個人データ取得
    // ------------------------------
    useEffect(() => {
        if (!studentId || !table) return;

        fetch(`/api/getStudentInfo?table=${table}&studentId=${studentId}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data || data.error) {
                    console.error("生徒情報なし:", data);
                    return;
                }
                setStudent(data);
            })
            .catch((err) => console.error("生徒情報取得エラー:", err));
    }, [studentId, table]);

    // 月ごとの出席データ（仮）
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

    // 月を押したときの遷移
    const goToMonth = (studentId, m) => {
        router.push(
            `/admin/important/classPage/syousai/attendance_situation?studentId=${studentId}&table=${table}&month=${m}`
        );
    };

    return (
        <main className={styles.Main}>
            <div className={styles.matome}>

                <h1 className={styles.students_ID}>
                    {studentId}
                </h1>

                {/* 生徒情報 */}
                <ul className={styles.jouhou}>
                    <li className={styles.jouhou_01}>ID：{studentId}</li>
                    <li className={styles.jouhou_01}>名前：{student?.name ?? ""}</li>
                    <li className={styles.jouhou_02}>email：{student?.email ?? ""}</li>
                    <li className={styles.jouhou_01}>password：{student?.password ?? ""}</li>
                </ul>

                {/* 4〜9月 */}
                <div className={styles.M01_M06_button_summary}>
                    {["04", "05", "06", "07", "08", "09"].map((m) => (
                        <div key={m} className={styles.month_block}>
                            <button
                                className={styles.M01_06_button}
                                onClick={() => goToMonth(studentId, m)}
                            >
                                {parseInt(m)}月
                            </button>
                            <p className={styles.behind_time_text}>
                                遅刻：{monthSummary[m].late}回
                                コマ：{monthSummary[m].attendedKoma}/{monthSummary[m].totalKoma}
                            </p>
                        </div>
                    ))}
                </div>

                {/* 10〜3月 */}
                <div className={styles.M07_M12_button_summary}>
                    {["10", "11", "12", "01", "02", "03"].map((m) => (
                        <div key={m} className={styles.month_block}>
                            <button
                                className={styles.M07_12_button}
                                onClick={() => goToMonth(studentId, m)}
                            >
                                {parseInt(m)}月
                            </button>
                            <p className={styles.behind_time_text}>
                                遅刻：{monthSummary[m].late}回
                                コマ：{monthSummary[m].attendedKoma}/{monthSummary[m].totalKoma}
                            </p>
                        </div>
                    ))}
                </div>

                <button
                    className={styles.return_button}
                    onClick={() => router.push(`/admin/important/classPage?table=${table}`)}
                >
                    戻る
                </button>

                <button className={styles.deth}>削除</button>
            </div>
        </main>
    );
}
