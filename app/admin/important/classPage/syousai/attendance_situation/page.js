"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ==========================================================
// Attendance Situation 修正版 (ビルド通る版)
// ==========================================================
export default function AttendanceSituation() {
    const router = useRouter();

    const [studentId, setStudentId] = useState(null);
    const [month, setMonth] = useState(null);
    const [tableBase, setTableBase] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [days, setDays] = useState([]);

    // --- クエリ取得 ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sid = params.get("studentId");
        const m = params.get("month");
        const t = params.get("table");

        setStudentId(sid);
        setMonth(m);
        setTableBase(t);

        if (m) {
            const daysInMonth = new Date(2025, parseInt(m), 0).getDate();
            const daysArr = Array.from({ length: daysInMonth }, (_, i) =>
                `${m}/${String(i + 1).padStart(2, "0")}`
            );
            setDays(daysArr);
        }
    }, []);

    const table = tableBase ? `${tableBase}_attendance` : null;

    // --- admin チェック ---
    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            alert("管理者ログインが必要です");
            router.push("/admin");
        }
    }, [router]);

    // --- 初期値関数 ---
    const initRow = () => ({
        koma1: "absent",
        koma2: "absent",
        koma3: "absent",
        koma4: "absent",
        manual: false,
    });

    // --- DBロード ---
    useEffect(() => {
        if (!studentId || !month || !table || days.length === 0) return;

        fetch(`/api/getAttendance?studentId=${studentId}&table=${table}&month=${month}`)
            .then(res => res.json())
            .then(data => {
                const updated = days.map(initRow);

                if (Array.isArray(data)) {
                    const convertStatus = (v) => (v === 1 ? "present" : v === 2 ? "late" : "absent");

                    data.forEach(row => {
                        const dayNum = parseInt(row.date.split("-")[2], 10);
                        const idx = dayNum - 1;
                        if (!updated[idx]) return;

                        updated[idx].koma1 = convertStatus(row.koma1);
                        updated[idx].koma2 = convertStatus(row.koma2);
                        updated[idx].koma3 = convertStatus(row.koma3);
                        updated[idx].koma4 = convertStatus(row.koma4);
                    });
                }

                setAttendance(updated);
            })
            .catch(() => setAttendance(days.map(initRow)));
    }, [studentId, month, table, days]);

    // --- 土日判定 ---
    const isWeekend = (day) => {
        const d = new Date(`2025-${day.replace("/", "-")}`);
        const w = d.getDay();
        return w === 0 || w === 6;
    };

    // --- コマクリック切替 ---
    const toggleKoma = (index, key) => {
        const newData = [...attendance];
        const current = newData[index][key];

        newData[index][key] =
            current === "present" ? "late" :
                current === "late" ? "absent" :
                    "present";

        newData[index].manual = true;
        setAttendance(newData);
    };

    // --- 遅刻判定 ---
    const judgeSummary = (row) => {
        const k = [row.koma1, row.koma2, row.koma3, row.koma4];
        if (k[3] === "absent") return "absent";
        if (k[3] === "late") return "late";
        if (k.slice(0,3).includes("late") || k.slice(0,3).includes("absent")) return "late";
        if (k.every(v => v === "present")) return "present";
        return "present";
    };

    const summaryLabel = (row) => {
        const summary = judgeSummary(row);
        return summary === "present" ? "出席" :
            summary === "late" ? "遅刻あり" :
                "欠課あり";
    };

    const komaLabel = (status) =>
        status === "present" ? "出席" :
            status === "late" ? "遅刻" :
                "欠課";

    const statusClass = (status, weekend) => {
        if (weekend) return styles.weekend;
        if (status === "present") return styles.bg_present;
        if (status === "late") return styles.bg_late;
        if (status === "absent") return styles.bg_absent;
        return "";
    };

    // --- UI ---
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
                                className={`${styles.item_li} ${statusClass(attendance[idx]?.[k], weekend)}`}
                                onClick={() => toggleKoma(idx,k)}
                            >
                                {!weekend && komaLabel(attendance[idx]?.[k] ?? "absent")}
                            </li>
                        ))}

                        <li className={`${styles.item_li} ${statusClass(judgeSummary(attendance[idx] ?? initRow()), weekend)}`}>
                            {!weekend && summaryLabel(attendance[idx] ?? initRow())}
                        </li>
                    </ul>
                );
            })}
        </main>
    );
}
