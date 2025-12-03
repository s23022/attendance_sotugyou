"use client";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Attendance_Situation() {
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
    const searchParams = useSearchParams();
    const studentId = searchParams.get("studentId") || "s23022";
    const month = searchParams.get("month") || "01";

    const daysInMonth = (m) => {
        const y = 2025;
        return new Date(y, parseInt(m), 0).getDate();
    };

    const days = Array.from({ length: daysInMonth(month) }, (_, i) =>
        `${month}/${String(i + 1).padStart(2, "0")}`
    );

    // attendance = { koma1, koma2, koma3, koma4, lateMode, manual }
    const [attendance, setAttendance] = useState(
        days.map(() => ({
            koma1: false,
            koma2: false,
            koma3: false,
            koma4: false,
            lateMode: "none", // 初期は空白
            manual: false, // true なら手動で上書き
        }))
    );

    const isWeekend = (day) => {
        const date = new Date(`2025-${day.replace("/", "-")}`);
        const w = date.getDay();
        return w === 0 || w === 6;
    };

    // 1〜4コマの出欠を切り替え
    const toggleAttendance = (index, key) => {
        const newData = [...attendance];
        newData[index][key] = !newData[index][key];
        newData[index].manual = false; // 自動判定に戻す
        setAttendance(newData);
    };

    // 遅刻欄クリック → 出席 → 欠課 → 遅刻 → 出席… のローテーション
    const rotateLate = (index) => {
        const newData = [...attendance];
        newData[index].manual = true;

        const order = ["present", "absent", "late"];
        const current = newData[index].lateMode;

        const next = current === "present" ? "absent"
            : current === "absent" ? "late"
                : "present";

        newData[index].lateMode = next;
        setAttendance(newData);
    };

    // 自動判定
    const autoLateJudge = (data) => {
        return data.map((row, idx) => {
            if (row.manual) return row; // 手動なら無視
            if (isWeekend(days[idx])) return row; // 土日は判定しない

            const komas = [row.koma1, row.koma2, row.koma3, row.koma4];
            const allPresent = komas.every((k) => k === true);
            const anyAbsent = komas.some((k) => k === false);
            const anyLate = row.lateMode === "late";

            let mode = "none"; // 初期は空白
            if (anyLate) mode = "late";
            else if (anyAbsent && komas.some(k => k !== null)) mode = "absent";
            else if (allPresent) mode = "present";

            row.lateMode = mode;
            return row;
        });
    };

    useEffect(() => {
        setAttendance((prev) => autoLateJudge([...prev]));
    }, [attendance.map(a => [a.koma1, a.koma2, a.koma3, a.koma4].join("")).join("")]);

    return (
        <main className={styles.Main}>
            <button
                className={styles.return_button}
                onClick={() =>
                    router.push("/admin/important/classPage/syousai")
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

            {days.map((day, index) => {
                const weekend = isWeekend(day);

                // 遅刻欄の文字と色
                const statusClass =
                    weekend
                        ? "" // 土日は文字も色もなし
                        : attendance[index].lateMode === "present"
                            ? styles.status_present
                            : attendance[index].lateMode === "absent"
                                ? styles.status_absent
                                : attendance[index].lateMode === "late"
                                    ? styles.status_late
                                    : "";

                const statusLabel =
                    weekend
                        ? ""
                        : attendance[index].lateMode === "present"
                            ? "出席"
                            : attendance[index].lateMode === "absent"
                                ? "欠課"
                                : attendance[index].lateMode === "late"
                                    ? "遅刻"
                                    : "";

                return (
                    <ul
                        key={index}
                        className={`${styles.explanation_ul} ${
                            weekend ? styles.weekend : ""
                        }`}
                    >
                        <li className={styles.item_li}>{day}</li>

                        {["koma1", "koma2", "koma3", "koma4"].map((key) => (
                            <button
                                key={key}
                                className={`${styles.item_li} ${
                                    attendance[index][key] ? styles.attended : ""
                                }`}
                                onClick={() => toggleAttendance(index, key)}
                            >
                                {attendance[index][key] ? "✓" : ""}
                            </button>
                        ))}

                        {/* 遅刻欄 */}
                        <li
                            className={`${styles.item_li} ${statusClass}`}
                            onClick={() => {
                                if (!weekend) rotateLate(index)
                            }}
                        >
                            {statusLabel}
                        </li>
                    </ul>
                );
            })}
        </main>
    );
}
