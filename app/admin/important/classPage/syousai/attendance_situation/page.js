"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ==========================================================
// Attendance Situation 完全版（仕様完全一致）
// ----------------------------------------------------------
// ・コマ手動修正（✓）
// ・遅刻欄クリックで rotate（present → absent → late）
// ・自動判定は仕様通り
// ・背景は item_li 全体に付与
// ・CSS は既存を崩さない（追加クラスのみ）
// ==========================================================

export default function Attendance_Situation() {
    const router = useRouter();

    // --- admin チェック ---
    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            alert("管理者ログインが必要です");
            router.push("/admin");
        }
    }, []);

    const params = useSearchParams();

    const studentId = params.get("studentId");
    const month = params.get("month");

    // 通常テーブル（例：s3） → 出席テーブル（例：s3_attendance）
    const tableBase = params.get("table");
    const table = `${tableBase}_attendance`;

    // --- 月の日数 ---
    const daysInMonth = (m) => new Date(2025, parseInt(m), 0).getDate();

    const days = Array.from({ length: daysInMonth(month) }, (_, i) =>
        `${month}/${String(i + 1).padStart(2, "0")}`
    );

    // --- 初期値 ---
    const initRow = () => ({
        koma1: false,
        koma2: false,
        koma3: false,
        koma4: false,
        lateMode: "none",
        manual: false,
    });

    const [attendance, setAttendance] = useState(days.map(initRow));

    // ==========================================================
    // DB ロード（ *_attendance テーブル）
    // ==========================================================
    useEffect(() => {
        if (!studentId || !table || !month) return;

        fetch(`/api/getAttendance?studentId=${studentId}&table=${table}&month=${month}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("API:", data);

                if (!Array.isArray(data)) {
                    setAttendance(days.map(initRow));
                    return;
                }

                const updated = days.map(initRow);

                data.forEach((row) => {
                    const dayNum = parseInt(row.date.split("-")[2], 10);
                    const idx = dayNum - 1;

                    if (!updated[idx]) return;

                    updated[idx].koma1 = row.koma1 === 1;
                    updated[idx].koma2 = row.koma2 === 1;
                    updated[idx].koma3 = row.koma3 === 1;
                    updated[idx].koma4 = row.koma4 === 1;

                    updated[idx].lateMode = row.late_mode || "none";
                });

                setAttendance(updated);
            })
            .catch(() => {
                setAttendance(days.map(initRow));
            });
    }, [studentId, table, month]);

    // ==========================================================
    // 土日
    // ==========================================================
    const isWeekend = (day) => {
        const d = new Date(`2025-${day.replace("/", "-")}`);
        const w = d.getDay();
        return w === 0 || w === 6;
    };

    // ==========================================================
    // コマ toggle（手動修正）
    // ==========================================================
    const toggleAttendance = (index, key) => {
        const newData = [...attendance];
        newData[index][key] = !newData[index][key];
        newData[index].manual = false;
        setAttendance(newData);
    };

    // ==========================================================
    // 遅刻欄 rotate（present → absent → late）
    // ==========================================================
    const rotateLate = (index) => {
        const newData = [...attendance];
        newData[index].manual = true;

        const current = newData[index].lateMode;

        const next =
            current === "present" ? "absent" :
                current === "absent" ? "late" :
                    "present";

        newData[index].lateMode = next;

        setAttendance(newData);
    };

    // ==========================================================
    // 自動判定（仕様に完全一致）
    // ==========================================================
    const autoLateJudge = (row) => {
        if (row.manual) return row;

        const k1 = row.koma1;
        const k2 = row.koma2;
        const k3 = row.koma3;
        const k4 = row.koma4;

        const allPresent = k1 && k2 && k3 && k4;
        const anyAbsent = !k1 || !k2 || !k3;
        const k4Absent = !k4;

        if (allPresent) {
            row.lateMode = "present";
            return row;
        }

        if (k4Absent) {
            row.lateMode = "absent";
            return row;
        }

        if (anyAbsent) {
            row.lateMode = "late";
            return row;
        }

        row.lateMode = "late";
        return row;
    };



    // komas が変わったら自動判定
    useEffect(() => {
        setAttendance((prev) => autoLateJudge([...prev]));
    }, [
        attendance
            .map((a) => [a.koma1, a.koma2, a.koma3, a.koma4].join(""))
            .join("")
    ]);

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

                const statusClass =
                    weekend ? "" :
                        attendance[idx].lateMode === "present" ? styles.status_present :
                            attendance[idx].lateMode === "absent" ? styles.status_absent :
                                attendance[idx].lateMode === "late" ? styles.status_late : "";

                const statusLabel =
                    weekend ? "" :
                        attendance[idx].lateMode === "present" ? "出席" :
                            attendance[idx].lateMode === "absent" ? "欠課" :
                                attendance[idx].lateMode === "late" ? "遅刻" : "";

                return (
                    <ul key={idx} className={`${styles.explanation_ul} ${weekend ? styles.weekend : ""}`}>
                        <li className={styles.item_li}>{day}</li>

                        {["koma1", "koma2", "koma3", "koma4"].map((k) => (
                            <button
                                key={k}
                                className={`${styles.item_li} ${attendance[idx][k] ? styles.attended : ""}`}
                                onClick={() => toggleAttendance(idx, k)}
                            >
                                {attendance[idx][k] ? "✓" : ""}
                            </button>
                        ))}

                        <li
                            className={`${styles.item_li} ${statusClass}`}
                            onClick={() => !weekend && rotateLate(idx)}
                        >
                            {statusLabel}
                        </li>
                    </ul>
                );
            })}
        </main>
    );
}
