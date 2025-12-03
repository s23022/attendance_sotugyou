import styles from './page.module.css'
import {useEffect, useState} from "react";

// ==========================
// 学校の座標
// ==========================
const SCHOOL_LAT = 26.2107212;
const SCHOOL_LNG = 127.6860962;
const RADIUS_METERS = 100;

// ==========================
// 出席判定の時間帯情報（遅刻判定用）
// ==========================
const ATTENDANCE_WINDOWS = [
    {startHour: 6,  startMinute: 0},   // 1コマ
    {startHour: 11, startMinute: 0},   // 2コマ
    {startHour: 13, startMinute: 50},  // 3コマ
    {startHour: 15, startMinute: 20},  // 4コマ
];

export default function Attendance() {

    const [canAttend, setCanAttend] = useState(false);
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");

    const [attendedClasses, setAttendedClasses] = useState([false, false, false, false]);
    const [lateClasses, setLateClasses] = useState([false, false, false, false]);

    // ==========================
    // 出席ボタン押下
    // ==========================
    const handleAttendance = () => {
        const now = new Date();

        // 17時以降は出席不可
        if (now.getHours() >= 17) {
            setMessage("本日の授業は終了しました");
            setMessageColor("red");
            return;
        }

        if (!canAttend) {
            setMessage("現在の場所では出席を確認できません");
            setMessageColor("red");
            return;
        }

        const newAttended = [...attendedClasses];
        const newLate = [...lateClasses];

        // どのコマに対応するかを判定（遅刻判定用）
        let attendedIndex = -1;
        ATTENDANCE_WINDOWS.forEach((w, index) => {
            const start = new Date();
            start.setHours(w.startHour, w.startMinute, 0, 0);
            if (now >= start) {
                attendedIndex = index;
            }
        });

        // 出席登録
        const currentIndex = attendedIndex >= 0 ? attendedIndex : 0; // 遅刻判定用
        newAttended[currentIndex] = true;

        // 1コマ目スキップして2コマ以降で押した場合 → 1コマ目遅刻
        if (currentIndex > 0 && !newAttended[0]) {
            newLate[0] = true;
        }

        // 現在時刻が授業開始時刻を過ぎていたら遅刻扱い
        if (attendedIndex >= 0) {
            const start = new Date();
            start.setHours(ATTENDANCE_WINDOWS[attendedIndex].startHour, ATTENDANCE_WINDOWS[attendedIndex].startMinute, 0, 0);
            if (now > start) {
                newLate[attendedIndex] = true;
            }
        }

        setAttendedClasses(newAttended);
        setLateClasses(newLate);

        // 遅刻が1つでもあるか
        const hasLate = newLate.some(v => v === true);

        if (hasLate) {
            setMessage("遅刻です、出席を確認しました");
            setMessageColor("orange");
        } else {
            setMessage("出席を確認しました！");
            setMessageColor("green");
        }
    };

    // ==========================
    // 距離判定（校舎内か）
    // ==========================
    const getDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371000;
        const toRad = deg => (deg * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // ==========================
    // 現在地で校舎内判定
    // ==========================
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watcher = navigator.geolocation.watchPosition(
            pos => {
                const distance = getDistance(
                    pos.coords.latitude,
                    pos.coords.longitude,
                    SCHOOL_LAT,
                    SCHOOL_LNG
                );

                const inside = distance <= RADIUS_METERS;

                setCanAttend(inside);
                setMessage(inside ? "" : "現在、学校外です");
                setMessageColor(inside ? "" : "red");
            },
            err => console.error(err)
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    return (
        <>
            <div className={styles.GPS} style={{color: messageColor}}>
                {message}
            </div>

            <div className={styles.button_summary}>
                <button
                    className={styles.attendance}
                    onClick={handleAttendance}
                    disabled={!canAttend}
                >
                    出席
                </button>
            </div>
        </>
    );
}
