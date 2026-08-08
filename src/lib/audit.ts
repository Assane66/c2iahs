import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type AuditAction = 
  | 'inscription_accepted'
  | 'inscription_rejected'
  | 'inscription_edited'
  | 'student_created'
  | 'student_deleted'
  | 'payment_added'
  | 'payment_deleted'
  | 'class_created'
  | 'announcement_created'
  | 'program_created'
  | 'event_created'
  | 'gallery_created'
  | 'settings_updated'
  | 'user_role_updated'
  | 'backup_restored';

export async function logAuditAction(
  action: AuditAction,
  details: string,
  userName: string = 'Admin'
) {
  try {
    await addDoc(collection(db, 'activityLog'), {
      action,
      details,
      userName,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}
