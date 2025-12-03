"use client"
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { useEffect } from "react";

export default function Important() {
    const router = useRouter()

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

    return (
        <main className={styles.Main}>
            <button className={styles.return_button} onClick={() => router.push("/")}>戻る</button>
            <div className={styles.database}>
                <p className={styles.special_list}>ITスペシャリスト科</p>
                <p className={styles.information_engineering_text}>情報工学コース</p>
                <div className={styles.information_engineering_list}>
                    <button className={styles.information_engineering_button}>１年生</button>
                    <button className={styles.information_engineering_button}>２年生</button>
                    <button className={styles.information_engineering_button}>３年生</button>
                </div>
                <p className={styles.security_text}>セキュリティコース</p>
                <div className={styles.security_list}>
                    <button className={styles.security_button}>１年生</button>
                    <button className={styles.security_button}>２年生</button>
                </div>
                <p className={styles.creator_text}>ゲームクリエイター科</p>
                <div className={styles.creator_list}>
                    <button className={styles.creator_button}>１年生</button>
                    <button className={styles.creator_button}>２年生</button>
                </div>
            </div>
        </main>
    )
}