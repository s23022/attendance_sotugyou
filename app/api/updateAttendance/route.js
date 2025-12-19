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
    const {
        studentId,
        table,
        date,
        koma1,
        koma2,
        koma3,
        koma4,
    } = await req.json();

    if (!studentId || !table || !date) {
        return new Response(
            JSON.stringify({ error: "必須パラメータ不足" }),
            { status: 400 }
        );
    }

    try {
        const conn = await mysql.createConnection(dbConfig);

        // すでにその日のデータがあるか確認
        const [rows] = await conn.execute(
            `SELECT id FROM \`${table}\` WHERE student_id = ? AND date = ?`,
            [studentId, date]
        );

        if (rows.length > 0) {
            // UPDATE
            await conn.execute(
                `UPDATE \`${table}\`
                 SET koma1 = ?, koma2 = ?, koma3 = ?, koma4 = ?
                 WHERE student_id = ? AND date = ?`,
                [koma1, koma2, koma3, koma4, studentId, date]
            );
        } else {
            // INSERT
            await conn.execute(
                `INSERT INTO \`${table}\`
                 (student_id, date, koma1, koma2, koma3, koma4)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [studentId, date, koma1, koma2, koma3, koma4]
            );
        }

        await conn.end();

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200 }
        );

    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "DB error", detail: error.message }),
            { status: 500 }
        );
    }
}
