import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const month = searchParams.get("month"); // "01" 〜 "12"

        if (!studentId || !month) {
            return NextResponse.json(
                { error: "studentId と month が必要です" },
                { status: 400 }
            );
        }

        // 1日の00:00 と 月末の 23:59 を求める
        const year = new Date().getFullYear();
        const startDate = new Date(`${year}-${month}-01T00:00:00`);
        const endDate = new Date(year, month, 0); // 月末の日付
        endDate.setHours(23, 59, 59);

        // DB から該当月の出席データ取得
        const records = await prisma.attendance.findMany({
            where: {
                student_id: studentId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // 集計
        const late = records.filter(r => r.status === "late").length;
        const attendedKoma = records.filter(r => r.status === "attended").length;
        const totalKoma = records.length;

        return NextResponse.json({
            studentId,
            month,
            late,
            attendedKoma,
            totalKoma
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "サーバー側でエラーが発生しました" },
            { status: 500 }
        );
    }
}
