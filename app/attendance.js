"use client";

import styles from './page.module.css';
import { useEffect, useState } from "react";

const SCHOOL_LAT = 26.2107212;
const SCHOOL_LNG = 127.6860962;
const RADIUS_METERS = 200;

// 各コマの判定時間と遅刻ウィンドウ
const ATTENDANCE_WINDOWS = [
    { startHour: 0,   startMinute: 0,   lateDeadline: {hour:9, minute:30} }, // 1コマ
    { startHour:11,   startMinute: 0,   lateDeadline: {hour:11, minute:20} }, // 2コマ
    { startHour:13,   startMinute:50,   lateDeadline: {hour:14, minute:10} }, // 3コマ
    { startHour:15,   startMinute:20,   lateDeadline: {hour:15, minute:40} }, // 4コマ
];

export default function Attendance() {
    const [loggedInStudent, setLoggedInStudent] = useState(null);
    const [canAttend, setCanAttend] = useState(false);
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");

    // ログイン情報取得
    useEffect(() => {
        const stored = localStorage.getItem("loggedInStudent");
        if (stored) setLoggedInStudent(JSON.parse(stored));
    }, []);

    // GPSチェック
    const getDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371000;
        const toRad = deg => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    };

    useEffect(() => {
        if (!navigator.geolocation) return;
        const watcher = navigator.geolocation.watchPosition(
            pos => {
                const distance = getDistance(pos.coords.latitude, pos.coords.longitude, SCHOOL_LAT, SCHOOL_LNG);
                const inside = distance <= RADIUS_METERS;
                setCanAttend(inside);
                setMessage(inside ? "" : "現在、学校外です");
                setMessageColor(inside ? "" : "red");
            },
            err => console.error(err)
        );
        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    const handleAttendance = async () => {
        if (!loggedInStudent?.studentId) {
            setMessage("ログインしてください");
            setMessageColor("red");
            return;
        }
        if (now.getHours() >= 17) {
            setMessage("17時以降は出席できません");
            setMessageColor("red");
            return;
        }
        if (!canAttend) {
            setMessage("現在の場所では出席を確認できません");
            setMessageColor("red");
            return;
        }

        const now = new Date();
        let attendedIndex = -1;

        ATTENDANCE_WINDOWS.forEach((w, index) => {
            const start = new Date();
            start.setHours(w.startHour, w.startMinute, 0, 0);
            if (now >= start) attendedIndex = index;
        });
        if (attendedIndex < 0) attendedIndex = 0;

        try {
            const res = await fetch("/api/attendance/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: loggedInStudent.studentId,
                    classGroup: loggedInStudent.classGroup,
                    slotIndex: attendedIndex,
                    timestamp: now.toISOString()
                })
            });
            const data = await res.json();

            if (!data.success) {
                setMessage(data.message || "DB更新に失敗しました");
                setMessageColor("red");
                return;
            }

            setMessage(data.message || (data.late ? "遅刻です" : "出席確認完了"));
            setMessageColor(data.late ? "orange" : "green");

        } catch (err) {
            console.error(err);
            setMessage("サーバーエラー");
            setMessageColor("red");
        }
    };

    return (
        <>
            <div className={styles.GPS} style={{ color: messageColor }}>
                {message}
            </div>
            <div className={styles.button_summary}>
                <button className={styles.attendance} onClick={handleAttendance} disabled={!canAttend || new Date().getHours() >= 17}>
                    出席
                </button>
            </div>
        </>
    );
}
