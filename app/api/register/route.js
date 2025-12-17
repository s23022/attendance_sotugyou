import mysql from "mysql2/promise";

const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "secret",
    database: "attendance_db",
    port: 3306,
    charset: "utf8mb4"
};

export async function POST(req) {
    try {
        const body = await req.json();
        const { tableName, studentId, email, password, name, department, year } = body;

        if (!tableName || !studentId || !email || !password || !name || !department || !year) {
            return new Response(
                JSON.stringify({ success: false, message: "入力不足" }),
                { status: 400 }
            );
        }

        const connection = await mysql.createConnection(dbConfig);

        // ==========================
        // 1. 生徒情報を登録
        // ==========================
        const insertStudentQuery = `
            INSERT INTO \`${tableName}\` (student_id, email, password, name, department, grade)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(insertStudentQuery, [studentId, email, password, name, department, year]);

        // ==========================
        // 2. 出席状況テーブルに初期レコードを作成
        // ==========================
        const attendanceTable = `${tableName}_attendance`;

        const today = new Date();
        const currentYear = today.getFullYear();

        // 学校年度の開始と終了
        const fiscalStart = new Date(currentYear, 3, 1); // 4月1日
        const fiscalEnd = new Date(currentYear + 1, 2, 31); // 翌年3月31日

        // 生成開始日：今日が4〜12月なら今年4月、1〜3月なら前年4月
        const startYear = today.getMonth() >= 3 ? currentYear : currentYear - 1;
        const startDate = new Date(startYear, 3, 1);

        for (let d = new Date(startDate); d <= fiscalEnd; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD

            const insertAttendanceQuery = `
                INSERT INTO \`${attendanceTable}\` 
                (student_id, date, koma1, koma2, koma3, koma4)
                VALUES (?, ?, 0, 0, 0, 0)
            `;
            await connection.execute(insertAttendanceQuery, [studentId, dateStr]);
        }

        await connection.end();

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ success: false, message: err.message }),
            { status: 500 }
        );
    }
}
