"use client";
import styles from './page.module.css';
import { useRouter } from "next/navigation";
import { useState } from "react";

// APIに登録リクエスト
async function registerUser(data) {
    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export default function Login() {
    const router = useRouter();
    const [studentId, setStudentId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");

    const handleRegister = async () => {
        let tableName = "";

        if (department === "ITスペシャリスト科") {
            if (studentId[0] === "s") {
                if (year === "1") tableName = "s1";
                else if (year === "2") tableName = "s2";
                else if (year === "3") tableName = "s3";
            } else if (studentId[0] === "c") {
                if (year === "1") tableName = "c1";
                else if (year === "2") tableName = "c2";
            }
        } else if (department === "ゲームクリエイター科") {
            if (year === "1") tableName = "n1";
            else if (year === "2") tableName = "n2";
        }

        if (!tableName) {
            alert("テーブル判定に失敗しました。学籍番号・学科・学年を確認してください。");
            return;
        }

        const formData = { tableName, studentId, email, password, name, department, year };
        const result = await registerUser(formData);

        if (result.success) {
            alert("登録完了しました！");
            closeRegisterModal();
        } else {
            alert("登録に失敗しました: " + result.message);
        }
    };

    const handleLogin = async () => {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await res.json();

        if (result.success) {
            localStorage.setItem("userName", result.user.name);
            localStorage.setItem("userId", result.user.student_id);
            localStorage.setItem("userClassGroup", result.user.table);
            alert("ログイン成功！");
            window.location.href = "/";
        } else {
            alert("ログイン失敗：" + result.message);
        }
    };

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const toggleLoginModal = () => setShowLoginModal(prev => !prev);
    const openRegisterModal = () => setShowRegisterModal(true);
    const closeRegisterModal = () => setShowRegisterModal(false);

    return (
        <>
            <div className={styles.login} onClick={toggleLoginModal}>ログイン</div>

            {showLoginModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.login_title}>ログイン</h2>
                        <input
                            className={styles.email}
                            type="email"
                            placeholder="メールアドレス"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            className={styles.password}
                            type="password"
                            placeholder="パスワード"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button className={styles.login_button} onClick={handleLogin}>ログイン</button>
                        <p className={styles.registration_message}>
                            登録を行ってない場合下記のボタンを押して下さい
                        </p>
                        <button className={styles.registration} onClick={openRegisterModal}>登録</button>
                    </div>
                </div>
            )}

            {showRegisterModal && (
                <div className={styles.registration_modalBackdrop}>
                    <h2 className={styles.registration_login_title}>新規登録</h2>
                    <div className={styles.registration_modalContent}>
                        <p>学籍番号を入力して下さい</p>
                        <input
                            className={styles.registration_ID_number}
                            type="text"
                            placeholder="例：s23022"
                            value={studentId}
                            onChange={e => setStudentId(e.target.value)}
                        />
                        <p>学年を入力してください（1 / 2 / 3）</p>
                        <input
                            className={styles.registration_cose}
                            type="number"
                            placeholder="例：1"
                            value={year}
                            onChange={e => setYear(e.target.value)}
                        />
                        <p>学校のメールアドレスを入力してください</p>
                        <input
                            className={styles.registration_email}
                            type="email"
                            placeholder="例：ITcollege@std.it-college.ac.jp"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <p>パスワードを入力してください</p>
                        <input
                            className={styles.registration_password}
                            type="password"
                            placeholder="例：password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <p>名前を入力して下さい</p>
                        <input
                            className={styles.registration_name}
                            type="text"
                            placeholder="例：比嘉優太"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <p>学科を入力してください</p>
                        <input
                            className={styles.registration_department}
                            type="text"
                            placeholder="例：ITスペシャリスト科"
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                        />
                    </div>

                    <div className={styles.registration_summary}>
                        <button className={styles.registration_login_button} onClick={handleRegister}>登録</button>
                        <button className={styles.registration_close_button} onClick={closeRegisterModal}>閉じる</button>
                    </div>
                </div>
            )}
        </>
    );
}
