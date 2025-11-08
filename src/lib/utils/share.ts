import crypto from 'crypto';

// Generate hash unik
export function generateShareId(surgeryId: string) {
  return crypto.createHash('sha256').update(surgeryId + Date.now()).digest('hex').slice(0, 8);
}

// Buat URL share aman
export function generateShareLink(baseUrl: string, shareId: string) {
  return `${baseUrl}/share/${shareId}`;
}
