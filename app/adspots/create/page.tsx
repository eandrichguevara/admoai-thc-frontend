'use client';

import { useRouter } from 'next/navigation';
import AdSpotForm from '../../../components/AdSpotForm';
import styles from './styles.module.css';

export default function CreateAdSpotPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <main className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <button onClick={handleCancel} className={styles.backButton}>
            <span className="material-icons">arrow_back</span>
          </button>
          <div className={styles.headerContent}>
            <span className={`material-icons ${styles.headerIcon}`}>add_box</span>
            <h1 className={styles.heading}>Create New Ad Spot</h1>
          </div>
        </div>
        <AdSpotForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </main>
  );
}
