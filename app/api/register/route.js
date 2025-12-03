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

        // 出席 0:欠課, 1:出席, 2:遅刻 として初期化
        const insertAttendanceQuery = `
            INSERT INTO \`${attendanceTable}\` 
            (student_id, date, koma1, koma2, koma3, koma4)
            VALUES (?, CURDATE(), 0, 0, 0, 0)
        `;
        await connection.execute(insertAttendanceQuery, [studentId]);

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
