"use client"
import styles from './page.module.css';
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        // 仮の管理者アカウント
        const adminEmail = "admin@itcollege.com";
        const adminPassword = "admin";

        if (email === adminEmail && password === adminPassword) {
            // 管理者ログイン成功
            localStorage.setItem("role", "admin");
            localStorage.setItem("adminEmail", email);

            alert("管理者ログイン成功！");
            router.push("/admin/important");
        } else {
            setError("メールアドレスまたはパスワードが違います");
        }
    };

    return (
        <main className={styles.Main}>
            <div className={styles.password_form}>
                <p className={styles.text}>管理者専用ログイン</p>

                <input
                    className={styles.password_01}
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className={styles.password_02}
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className={styles.admin_page_button}
                    onClick={handleSubmit}
                >
                    ログイン
                </button>

                {error && <p className={styles.error}>{error}</p>}
            </div>

            <button className={styles.return} onClick={() => router.push('/')}>
                戻る
            </button>
        </main>
    );
}
