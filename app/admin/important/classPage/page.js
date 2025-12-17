"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './page.module.css';

export default function ClassPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const table = searchParams.get("table"); // ← OK

    const [students, setStudents] = useState([]);

    // 管理者チェック
    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            alert("管理者ログインが必要");
            router.push("/admin");
        }
    }, []);

    // データ取得
    useEffect(() => {
        if (!table) return;

        fetch(`/api/getStudents?table=${table}`)
            .then(res => {
                if (!res.ok) throw new Error("Network Error");
                return res.json();
            })
            .then(data => {
                // ★ IDの末尾2桁でソート
                const sorted = [...data].sort((a, b) => {
                    const numA = parseInt(a.student_id.slice(-2));
                    const numB = parseInt(b.student_id.slice(-2));
                    return numA - numB;
                });

                setStudents(sorted);
            })
            .catch(err => console.error("データ取得失敗:", err));
    }, [table]);

    return (
        <main className={styles.Main}>
            <button
                className={styles.return_button}
                onClick={() => router.push("/admin/important")}
            >
                戻る
            </button>

            <div className={styles.matome}>
                <ul className={styles.status}>
                    <li className={styles.status_title}>ID</li>
                    <li className={styles.status_title}>名前</li>
                    <li className={styles.status_title}>メールアドレス</li>
                    <li className={styles.status_title}>出席詳細</li>
                </ul>

                {students.map(student => {
                    const sid = student.student_id ?? student.id;

                    return (
                        <ul key={sid} className={styles.status}>
                            <li className={styles.status_title}>{sid}</li>
                            <li className={styles.status_title}>{student.name}</li>
                            <li className={styles.status_title}>{student.email}</li>

                            <li className={styles.status_title}>
                                <button
                                    className={styles.syousai_button}
                                    onClick={() =>
                                        router.push(
                                            `/admin/important/classPage/syousai?studentId=${student.student_id}&table=${table}`
                                        )
                                    }
                                >
                                    詳細
                                </button>
                            </li>
                        </ul>
                    );
                })}
            </div>
        </main>
    );
}
