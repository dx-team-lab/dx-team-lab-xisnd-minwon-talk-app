import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { ActivityLog } from './types';

/**
 * Logs an administrative activity to the 'activity_logs' collection.
 */
export async function logActivity(
  db: Firestore,
  logData: Omit<ActivityLog, 'id' | 'createdAt'>
) {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      ...logData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error recording activity log:', error);
    // Logging failure shouldn't necessarily block the primary action,
    // but in a production app, we might want to handle this more robustly.
  }
}
