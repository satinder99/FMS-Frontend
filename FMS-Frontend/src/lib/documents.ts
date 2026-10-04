// [FRONTEND · React] src/lib/documents.ts
// Shared facts about trip documents. Keep in step with the server (Services/documentTypes.js).
import type { DocumentType } from '../types/trips';

/** The step the proof of delivery belongs to. The step cannot be completed until a file is uploaded. */
export const POD_STEP_KEY = 'pod_upload';

/** The server refuses anything bigger. Checking here saves a long upload that is bound to fail. */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const DOCUMENT_LABEL: Record<DocumentType, string> = {
  pod: 'Proof of delivery',
  bol: 'Bill of lading',
  itinerary: 'Itinerary',
  immigration: 'Immigration documents',
  other: 'Other document',
};

/** What the file picker should offer. HEIC/HEIF are what iPhones take; the server accepts them too. */
export const UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf';
