import mysql from "mysql2/promise";

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "3306", 10),
    charset: "utf8mb4",
};

export async function POST(req) {
    try {
        const { studentId, table } = await req.json();
        if (!studentId || !table) {
            return new Response(JSON.stringify({ success: false, message: "studentId と table が必要" }), { status: 400 });
        }

        const connection = await mysql.createConnection(dbConfig);

        // 1. 生徒基本情報削除
        await connection.execute(
            `DELETE FROM \`${table}\` WHERE student_id = ?`,
            [studentId]
        );

        // 2. 出席テーブル削除
        const attendanceTable = `${table}_attendance`;
        await connection.execute(
            `DELETE FROM \`${attendanceTable}\` WHERE student_id = ?`,
            [studentId]
        );

        await connection.end();

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
}
