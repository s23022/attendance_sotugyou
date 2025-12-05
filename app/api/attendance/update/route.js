import mysql from "mysql2/promise";

const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "secret",
    database: "attendance_db",
};

// コマごとの判定時間と遅刻ウィンドウ
const ATTENDANCE_WINDOWS = [
    { startHour: 0, startMinute: 0, lateHour: 9, lateMinute: 30 },   // 1コマ
    { startHour:11, startMinute: 0, lateHour:11, lateMinute:20 },   // 2コマ
    { startHour:13, startMinute:50, lateHour:14, lateMinute:10 },   // 3コマ
    { startHour:15, startMinute:20, lateHour:15, lateMinute:40 },   // 4コマ
];


export async function POST(req) {
    try {
        const { studentId, classGroup, slotIndex, timestamp } = await req.json();
        if (!studentId || !classGroup || slotIndex === undefined) {
            return new Response(JSON.stringify({ success: false, message: "入力不足" }), { status: 400 });
        }

        const tableName = `${classGroup}_attendance`;
        const connection = await mysql.createConnection(dbConfig);
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const [rows] = await connection.execute(
            `SELECT * FROM \`${tableName}\` WHERE student_id=? AND date=?`,
            [studentId, today]
        );

        const now = new Date(timestamp);
        const slotCols = ["koma1","koma2","koma3","koma4"];
        let slotValues = [0,0,0,0];

        if (rows.length > 0) {
            // 既存行から値を取得
            const row = rows[0];
            slotValues = slotCols.map(col => row[col] ?? 0);
        }

        // 過去コマを欠課に
        for (let i = 0; i < slotIndex; i++) {
            if (slotValues[i] === 0) slotValues[i] = 3; // 欠課
        }

        // 今コマの遅刻判定
        const lateDeadline = ATTENDANCE_WINDOWS[slotIndex];
        const deadline = new Date();
        deadline.setHours(lateDeadline.lateHour, lateDeadline.lateMinute, 0, 0);

        slotValues[slotIndex] = (now > deadline) ? 2 : 1; // 遅刻 or 出席

        if (rows.length === 0) {
            // 新規INSERT
            await connection.execute(
                `INSERT INTO \`${tableName}\` (student_id, date, koma1, koma2, koma3, koma4) VALUES (?, ?, ?, ?, ?, ?)`,
                [studentId, today, ...slotValues]
            );
        } else {
            // 既存UPDATE
            await connection.execute(
                `UPDATE \`${tableName}\` SET koma1=?, koma2=?, koma3=?, koma4=? WHERE student_id=? AND date=?`,
                [...slotValues, studentId, today]
            );
        }

        await connection.end();

        return new Response(JSON.stringify({
            success: true,
            late: slotValues[slotIndex] === 2,
            slotValues
        }), { status: 200 });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
}
