"use client"
import styles from './page.module.css';
import {useState, useEffect} from "react";
import {useRouter} from 'next/navigation';

// ==========================
// 定数: 学校の座標と範囲
// ==========================
const SCHOOL_LAT = 26.2107212; // ITカレッジ沖縄の緯度（正確な位置）
const SCHOOL_LNG = 127.6860962; // ITカレッジ沖縄の経度（正確な位置）
const RADIUS_METERS = 50; // 校舎範囲の半径（メートル単位）

export default function Home() {

    const router = useRouter();

    // ==========================
    // 今日の日付情報
    // ==========================
    const today = new Date();
    const year = today.getFullYear(); // 年
    const month = today.getMonth() + 1; // 月（0始まりのため +1）
    const date = today.getDate(); // 日
    const weekday = ["日", "月", "火", "水", "木", "金", "土"];
    const dayText = weekday[today.getDay()]; // 曜日（例: 水）

    // ==========================
    // 状態管理（useState）
    // ==========================
    const [currentTime, setCurrentTime] = useState(new Date()); // 現在時刻
    const [canAttend, setCanAttend] = useState(false); // 出席ボタン押せるか
    const [canEnd, setCanEnd] = useState(false); // 終了ボタン押せるか
    const [message, setMessage] = useState(""); // メッセージ表示内容
    const [messageColor, setMessageColor] = useState(""); // メッセージ色

    // ==========================
    // 関数: 緯度経度から距離を計算
    // Haversine公式を使用して地球上の距離を算出
    // ==========================
    const getDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371000; // 地球半径（メートル）
        const toRad = deg => (deg * Math.PI) / 180; // 度 → ラジアン
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // メートル単位で距離
    }

    // ==========================
    // useEffect: 現在時刻更新と終了ボタン有効化
    // 1秒ごとに更新
    // ==========================
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // 終了ボタンの有効化判定
            // 今はテスト用で 15:08 以降押せる
            const hours = now.getHours();
            const minutes = now.getMinutes();
            setCanEnd(hours > 17 || (hours === 17 && minutes >= 0));
        }, 1000);

        // コンポーネントがアンマウントされたときにタイマーをクリア
        return () => clearInterval(timer);
    }, []);

    // ==========================
    // useEffect: 位置情報取得と出席ボタン判定
    // ==========================
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watcher = navigator.geolocation.watchPosition(
            (pos) => {
                const distance = getDistance(
                    pos.coords.latitude,
                    pos.coords.longitude,
                    SCHOOL_LAT,
                    SCHOOL_LNG
                );
                setCanAttend(distance <= RADIUS_METERS);
            },
            (err) => console.log(err)
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);


    // ==========================
    // 出席ボタン押下時の処理
    // ==========================
    const handleAttendance = () => {
        if (canAttend) {
            setMessage("出席を確認しました！");
            setMessageColor("green");
            console.log("出席登録できました！");
        } else {
            setMessage("現在の場所では出席を確認できません");
            setMessageColor("red");
            console.log("学校にいないため出席できません");
        }
    };

    // ==========================
    // 終了ボタン押下時の処理
    // ==========================
    const handleEnd = () => {
        if (canEnd) {
            setMessage("出席確認を終了しました。お疲れさまでした！");
            setMessageColor("blue");
            console.log("終了処理を実行します");
            // ここに終了時のリセット処理やデータ送信処理を追加可能
        } else {
            setMessage("まだ終了時刻ではありません");
            setMessageColor("orange");
            console.log("まだ終了ボタンを押せません");
        }
    };

    // ==========================
    // レンダリング
    // ==========================
    return (
        <main className={styles.Main}>
            {/* タイトル */}
            <div className={styles.title}>出席管理</div>

            {/* 日付表示 */}
            <div className={styles.date}>{year}年{month}月{date}日({dayText})</div>

            {/* 現在時刻 */}
            <div className={styles.time}>{currentTime.toLocaleTimeString()}</div>

            {/* メッセージ表示 */}
            <div className={styles.GPS} style={{color: messageColor}}>{message}</div>

            {/* ボタン */}
            <div className={styles.button_summary}>
                {/* 出席ボタン */}
                <button className={styles.attendance} onClick={handleAttendance} disabled={!canAttend}>出席</button>

                {/* 終了ボタン */}
                <button className={styles.end} onClick={handleEnd} disabled={!canEnd}>終了</button>
            </div>

            {/* 病欠・私用申請ボタン（application_pageへ遷移)*/}
            <button className={styles.Reason_for_absence} onClick={() => router.push('/application_page')}>病欠・私用申請
            </button>
        </main>
    );
}
