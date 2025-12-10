import mysql from "mysql2/promise";

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    charset: "utf8mb4",
};

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const table = searchParams.get("table");

    if (!studentId || !table) {
        return new Response(
            JSON.stringify({ error: "studentId と table が必要です" }),
            { status: 400 }
        );
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        // student_id で検索
        const [rows] = await connection.execute(
            `SELECT * FROM \`${table}\` WHERE student_id = ? LIMIT 1`,
            [studentId]
        );

        await connection.end();

        if (rows.length === 0) {
            return new Response(JSON.stringify({ error: "データなし" }), { status: 404 });
        }

        return new Response(JSON.stringify(rows[0]), { status: 200 });

    } catch (err) {
        console.error("DB エラー:", err);
        return new Response(
            JSON.stringify({ error: "DB エラー" }),
            { status: 500 }
        );
    }
}
