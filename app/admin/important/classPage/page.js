"use client"
import styles from './page.module.css'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// 人数ぶんのデータ（仮）
const students = [
    { id: "s25001", name: "山田太郎", email: "yamada@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25001", name: "山田太郎", email: "yamada@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
    { id: "s25002", name: "佐藤花子", email: "sato@example.com" },
];

export default function ClassPage() {
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

    return (
        <main className={styles.Main}>
            <button className={styles.return_button} onClick={() => router.push("/admin/important")}>戻る</button>
            <div className={styles.matome}>

                {/* 見出し */}
                <ul className={styles.status}>
                    <li className={styles.status_title}>ID</li>
                    <li className={styles.status_title}>名前</li>
                    <li className={styles.status_title}>メールアドレス</li>
                    <li className={styles.status_title}>出席詳細</li>
                </ul>

                {/* ↓ ここで人数ぶん自動で生成 */}
                {students.map((student) => (
                    <ul key={student.id} className={styles.status}>
                        <li className={styles.status_title}>{student.id}</li>
                        <li className={styles.status_title}>{student.name}</li>
                        <li className={styles.status_title}>{student.email}</li>
                        <li className={styles.status_title}>
                            <button className={styles.syousai_button}>詳細</button>
                        </li>
                    </ul>
                ))}

            </div>
        </main>
    );
}