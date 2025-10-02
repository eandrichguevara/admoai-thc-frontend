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
        <h1 className={styles.heading}>Create New Ad Spot</h1>
        <AdSpotForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </main>
  );
}
