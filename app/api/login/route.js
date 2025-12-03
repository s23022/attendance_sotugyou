import mysql from "mysql2/promise";

const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "secret",
    database: "attendance_db",
};

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return new Response(
                JSON.stringify({ success: false, message: "入力不足" }),
                { status: 400 }
            );
        }

        // 全テーブルを検索（s1, s2, s3, c1, c2, n1, n2）
        const tables = ["s1", "s2", "s3", "c1", "c2", "n1", "n2"];

        const connection = await mysql.createConnection(dbConfig);

        let user = null;

        for (const table of tables) {
            const [rows] = await connection.execute(
                `SELECT * FROM \`${table}\` WHERE email = ? AND password = ? LIMIT 1`,
                [email, password]
            );
            if (rows.length > 0) {
                user = rows[0];
                user.table = table;
                break;
            }
        }

        await connection.end();

        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: "メール or パスワードが違います" }),
                { status: 401 }
            );
        }

        return new Response(JSON.stringify({ success: true, user }), { status: 200 });

    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ success: false, message: err.message }),
            { status: 500 }
        );
    }
}