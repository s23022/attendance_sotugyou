// app/layout.js
import './globals.css';

export const metadata = {
    title: 'Attendance Management',
    description: '出席管理アプリ',
};

export default function RootLayout({ children }) {
    return (
        <html lang="ja">
        <body>{children}</body>
        </html>
    );
}
