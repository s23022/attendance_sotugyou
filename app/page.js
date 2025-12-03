"use client"

import styles from './page.module.css';
import {useState, useEffect} from "react";
import {useRouter} from 'next/navigation';
import Explanation from "./explanation";
import Login from './login'
import Days from './days'
import Attendance from "@/app/attendance";


export default function Home() {
    const router = useRouter();

    // ==========================
    // 現在時刻管理（CSR対応）
    // ==========================
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        setMounted(true); // SSR → CSR のタイミングズレ防止

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    // ==========================
    // ログインユーザー名の取得
    // ==========================
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setUserName(storedName);
        }
    }, []);



    // ==========================
    // ログアウト処理
    // ==========================
    const handleLogout = () => {
        const confirmed = window.confirm("ログアウトしますか？");

        if (confirmed) {
            localStorage.removeItem("userName");
            localStorage.removeItem("userId");

            setUserName("");

            alert("ログアウトしました");
        }
    };


    // ==========================
    // レンダリング
    // ==========================
    return (
        <main className={styles.Main}>
            {/*管理者ページ*/}
            <button className={styles.admin} onClick={() => router.push("/admin")}>
                管理者
            </button>
            {/*ログイン・登録*/}
            <Login />
            {/*出席管理についての説明*/}
            <Explanation />
            {/*月日*/}
            <Days />
            {/* 現在時刻表示 */}
            {mounted && (
                <div className={styles.time}>{currentTime}</div>
            )}
            {/*出席*/}
            <Attendance />
            <div className={styles.user}>
                <p>現在ログインしているユーザー</p>
                <p className={styles.user_name}>{userName ? userName : "　"}</p>
            </div>
            {/* ログアウト（ログイン時のみ表示） */}
            {userName && (
                <p className={styles.logout} onClick={handleLogout}>
                    ログアウトする
                </p>
            )}
        </main>
    )
}
