"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ==========================================================
// Attendance Situation 修正版
// ・各コマ: 出席 / 遅刻 / 欠課 を文字列で管理
// ・遅刻欄: 新ルールで判定
// ・管理者クリックで切替: 出席 → 遅刻 → 欠課
// ・背景色追加（出席:薄緑 / 遅刻:薄赤 / 欠課:薄青）
// ==========================================================

export default function Attendance_Situation() {
    const router = useRouter();
    const params = useSearchParams();

    const studentId = params.get("studentId");
    const month = params.get("month");
    const tableBase = params.get("table");
    const table = `${tableBase}_attendance`;

    // --- admin チェック ---
    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            alert("管理者ログインが必要です");
            router.push("/admin");
        }
    }, []);

    // --- 月の日数 ---
    const daysInMonth = (m) => new Date(2025, parseInt(m), 0).getDate();
    const days = Array.from({ length: daysInMonth(month) }, (_, i) =>
        `${month}/${String(i + 1).padStart(2, "0")}`
    );

    // --- 初期値 ---
    const initRow = () => ({
        koma1: "absent",
        koma2: "absent",
        koma3: "absent",
        koma4: "absent",
        manual: false,
    });

    const [attendance, setAttendance] = useState(days.map(initRow));

    // ==========================================================
    // DBロード
    // ==========================================================
    useEffect(() => {
        if (!studentId || !table || !month) return;

        fetch(`/api/getAttendance?studentId=${studentId}&table=${table}&month=${month}`)
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    setAttendance(days.map(initRow));
                    return;
                }

                const updated = days.map(initRow);

                const convertStatus = (v) => {
                    if (v === 1) return "present";
                    if (v === 2) return "late";
                    return "absent";
                };

                data.forEach(row => {
                    const dayNum = parseInt(row.date.split("-")[2], 10);
                    const idx = dayNum - 1;
                    if (!updated[idx]) return;

                    updated[idx].koma1 = convertStatus(row.koma1);
                    updated[idx].koma2 = convertStatus(row.koma2);
                    updated[idx].koma3 = convertStatus(row.koma3);
                    updated[idx].koma4 = convertStatus(row.koma4);
                });

                setAttendance(updated);
            })
            .catch(() => setAttendance(days.map(initRow)));
    }, [studentId, table, month]);

    // ==========================================================
    // 土日判定
    // ==========================================================
    const isWeekend = (day) => {
        const d = new Date(`2025-${day.replace("/", "-")}`);
        const w = d.getDay();
        return w === 0 || w === 6;
    };

    // ==========================================================
    // コマクリック切替
    // ==========================================================
    const toggleKoma = (index, key) => {
        const newData = [...attendance];
        const current = newData[index][key];

        // 出席 → 遅刻 → 欠課 → 出席
        newData[index][key] =
            current === "present" ? "late" :
                current === "late" ? "absent" :
                    "present";

        newData[index].manual = true;
        setAttendance(newData);
    };

    // ==========================================================
    // 遅刻欄判定
    // ==========================================================
    const judgeSummary = (row) => {
        const k = [row.koma1, row.koma2, row.koma3, row.koma4];

        if (k[3] === "absent") return "absent";              // 4コマ欠課は欠課優先
        if (k[3] === "late") return "late";                  // 4コマ遅刻は遅刻
        if (k.slice(0,3).includes("late") || k.slice(0,3).includes("absent")) return "late"; // 1〜3コマの欠課・遅刻
        if (k.every(v => v === "present")) return "present"; // 全出席
        return "present"; // 念のための保険
    };


    const summaryLabel = (row) => {
        const summary = judgeSummary(row);
        return summary === "present" ? "出席" :
            summary === "late" ? "遅刻あり" :
                "欠課あり";
    };

    const komaLabel = (status) =>
        status === "present" ? "出席" :
            status === "late"    ? "遅刻" :
                "欠課";

    const statusClass = (status, isWeekend) => {
        if (isWeekend) return styles.weekend; // 土日は文字非表示・オレンジ背景
        if (status === "present") return styles.bg_present;
        if (status === "late") return styles.bg_late;
        if (status === "absent") return styles.bg_absent;
        return "";
    };

    // ==========================================================
    // UI
    // ==========================================================
    return (
        <main className={styles.Main}>
            <button
                className={styles.return_button}
                onClick={() =>
                    router.push(`/admin/important/classPage/syousai?studentId=${studentId}&table=${tableBase}`)
                }
            >
                戻る
            </button>

            <p className={styles.text_title}>
                {month}月の出席状況 - {studentId}
            </p>

            <ul className={styles.explanation_ul}>
                <li className={styles.item_li}>日にち</li>
                <li className={styles.item_li}>１コマ</li>
                <li className={styles.item_li}>２コマ</li>
                <li className={styles.item_li}>３コマ</li>
                <li className={styles.item_li}>４コマ</li>
                <li className={styles.item_li}>遅刻</li>
            </ul>

            {days.map((day, idx) => {
                const weekend = isWeekend(day);

                return (
                    <ul key={idx} className={`${styles.explanation_ul} ${weekend ? styles.weekend : ""}`}>
                        <li className={styles.item_li}>{day}</li>

                        {["koma1","koma2","koma3","koma4"].map(k => (
                            <li
                                key={k}
                                className={`${styles.item_li} ${statusClass(attendance[idx][k], weekend)}`}
                                onClick={() => toggleKoma(idx,k)}
                            >
                                {!weekend && komaLabel(attendance[idx][k])}
                            </li>
                        ))}

                        <li className={`${styles.item_li} ${statusClass(judgeSummary(attendance[idx]), weekend)}`}>
                            {!weekend && summaryLabel(attendance[idx])}
                        </li>
                    </ul>
                );
            })}
        </main>
    );
}
