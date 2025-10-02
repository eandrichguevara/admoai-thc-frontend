import AdCard from '../components/AdCard/index';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Hello Mobility Ad Spots!</h1>
        <div className={styles.cards}>
          <AdCard title="Summer Sale - 50% off" imageUrl="/file.svg" status="active" />
        </div>
      </div>
    </main>
  );
}
