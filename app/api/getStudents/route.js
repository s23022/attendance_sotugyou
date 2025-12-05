import mysql from "mysql2/promise";

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // ここを環境変数から取得する
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    charset: "utf8mb4",
};

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");

    if (!table) {
        return new Response(JSON.stringify({ error: "table が指定されていません" }), { status: 400 });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`SELECT student_id, name, email FROM \`${table}\``);
        await connection.end();

        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
