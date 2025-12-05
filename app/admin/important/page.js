"use client"
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { useEffect } from "react";

export default function Important() {
    const router = useRouter()

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            alert("管理者ログインが必要です");
            router.push("/admin");
        }
    }, []);

    return (
        <main className={styles.Main}>
            <button className={styles.return_button} onClick={() => router.push("/")}>戻る</button>
            <div className={styles.database}>
                <p className={styles.special_list}>ITスペシャリスト科</p>
                <p className={styles.information_engineering_text}>情報工学コース</p>
                <div className={styles.information_engineering_list}>
                    <button className={styles.information_engineering_button} onClick={() => router.push("/admin/classPage?table=s1")}>１年生</button>
                    <button className={styles.information_engineering_button} onClick={() => router.push("/admin/classPage?table=s2")}>２年生</button>
                    <button className={styles.information_engineering_button} onClick={() => router.push("/admin/classPage?table=s3")}>３年生</button>
                </div>
                <p className={styles.security_text}>セキュリティコース</p>
                <div className={styles.security_list}>
                    <button className={styles.security_button} onClick={() => router.push("/admin/classPage?table=c1")}>１年生</button>
                    <button className={styles.security_button} onClick={() => router.push("/admin/classPage?table=c2")}>２年生</button>
                </div>
                <p className={styles.creator_text}>ゲームクリエイター科</p>
                <div className={styles.creator_list}>
                    <button className={styles.creator_button} onClick={() => router.push("/admin/classPage?table=n1")}>１年生</button>
                    <button className={styles.creator_button} onClick={() => router.push("/admin/classPage?table=n2")}>２年生</button>
                </div>
            </div>
        </main>
    )
}
