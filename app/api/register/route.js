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
        // 学校年度：4月〜翌年3月
        const fiscalYearEnd = new Date(today.getMonth() >= 3 ? currentYear + 1 : currentYear, 2, 31);

        // 登録日から年度末までの日数分ループ
        for (
            let d = new Date(today);
            d <= fiscalYearEnd;
            d.setDate(d.getDate() + 1)
        ) {
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
