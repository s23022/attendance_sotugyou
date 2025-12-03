import styles from './page.module.css'

export default function Explanation() {
    return (
        <>
            {/* アプリの説明セクション */}
            <div className={styles.explanation}>
                <p className={styles.explanation_title}>出席管理について</p>
                <div className={styles.explanation_summary}>
                    <h2>使い方の流れ</h2>

                    {/* 校舎内でログイン説明 */}
                    <p><strong>校舎内でログイン</strong></p>
                    <p>このアプリは、学校（ITカレッジ沖縄）の範囲内にいるときだけ出席ボタンが押せます。外にいるとボタンは押せません。</p>

                    {/* 出席ボタンの説明 */}
                    <p><strong>出席ボタンを押す</strong></p>
                    <p>授業が始まる時間に出席ボタンを押すと、そのコマの出席が記録されます。</p>
                    <ul>
                        <li>1コマ目（9:30開始）に遅れて押すと「遅刻」と判定されます。</li>
                        <li>2コマ目以降は、授業開始時間＋10分までに押せば「出席」と判定されます。</li>
                        <li>1コマ目を逃して2コマ目に出席した場合は、1コマ目は「遅刻」、2コマ目は「出席」となります。</li>
                    </ul>

                    {/* メッセージ色の説明 */}
                    <p><strong>メッセージの確認</strong></p>
                    <ul>
                        <li>緑：全コマ出席（問題なし）</li>
                        <li>オレンジ：遅刻あり</li>
                        <li>赤：校舎外で押した場合（出席できません）</li>
                    </ul>

                    {/* 病欠・私用申請の説明 */}
                    <p><strong>病欠・私用の申請</strong></p>
                    <p>画面の「病欠・私用申請」ボタンを押すと申請ページに移動できます。</p>

                    {/* 授業終了とリセット */}
                    <p><strong>授業の終了とリセット</strong></p>
                    <ul>
                        <li>17:00以降：本日の授業は終了しました表示</li>
                        <li>24:00以降：出席記録リセット</li>
                    </ul>

                    {/* 授業コマの時間 */}
                    <p><strong>授業コマの時間</strong></p>
                    <ul>
                        <li>1コマ目：9:30〜11:00</li>
                        <li>2コマ目：11:10〜12:40</li>
                        <li>昼休憩：12:40〜13:50</li>
                        <li>3コマ目：13:50〜15:20</li>
                        <li>4コマ目：15:30〜17:00</li>
                    </ul>
                </div>
            </div>
        </>
    )
}