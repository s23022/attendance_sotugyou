"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './page.module.css';

export default function ClassPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // router.push({ pathname, query }) に完全対応した取得
    const table = searchParams.get("table");

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
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(data => {
                // data が配列として返ってくる前提
                setStudents(Array.isArray(data) ? data : []);
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

                {students.map(student => (
                    <ul
                        key={student.student_id ?? student.id}
                        className={styles.status}
                    >
                        <li className={styles.status_title}>
                            {student.student_id ?? student.id}
                        </li>
                        <li className={styles.status_title}>{student.name}</li>
                        <li className={styles.status_title}>{student.email}</li>

                        <li className={styles.status_title}>
                            <button
                                className={styles.syousai_button}
                                onClick={() =>
                                    router.push({
                                        pathname:
                                            "/admin/important/classPage/syousai/attendance_situation",
                                        query: {
                                            studentId:
                                                student.student_id ??
                                                student.id,
                                            month: "01",
                                        },
                                    })
                                }
                            >
                                詳細
                            </button>
                        </li>
                    </ul>
                ))}
            </div>
        </main>
    );
}
