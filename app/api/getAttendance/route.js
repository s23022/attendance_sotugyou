import mysql from "mysql2/promise";

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "3306", 10),
    charset: "utf8mb4",
};

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const studentId = searchParams.get("studentId");
    const table = searchParams.get("table");
    const month = searchParams.get("month");

    if (!studentId || !table || !month) {
        return new Response(JSON.stringify({
            error: "studentId, table, month が必要です"
        }), { status: 400 });
    }

    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute(
            `SELECT * FROM \`${table}\`
             WHERE student_id = ? AND MONTH(\`date\`) = ?`,
            [studentId, month]
        );

        await conn.end();

        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "DB error", detail: error.message }),
            { status: 500 }
        );
    }
}
