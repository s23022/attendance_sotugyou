"use client"
import styles from './page.module.css';
import {useRouter} from 'next/navigation';




export default function Application_page () {

    const router = useRouter();

    return (
        <main className={styles.Main}>
            <div className={styles.application_form}>


            </div>
            <button className={styles.return} onClick={() => router.push('/')}>戻る</button>
        </main>
    );
}