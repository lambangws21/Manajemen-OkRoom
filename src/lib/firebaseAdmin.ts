// lib/firebaseAdmin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:  "data-ok-b4091",
      clientEmail: "firebase-adminsdk-kpje5@data-ok-b4091.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCzjyVKINdg4325\nqNneblNSRZjnJffPRbhwPHyYn5Tx1qjKKcTokBfc9t5QcYhNpPFAMWvUguAyQHo7\nh5n/QPqjMPZe5u9n6WnZEy8a4w9lkS4OHEmP+QE0A8xkosaNxIzxStO3o26gHIIL\nQhT/DW7+Q1JIXTZ+l6xpY9Ik84v23e7mezbTfo0nLXHm8FKl8JQKDQ8nXASqK/CK\n69wwJwtPZM/QRgwuWfiEtGqJyw1y3sMuCKE8+rADQK1ntaQ7+nz/sIHGWcgn8KVB\nXoV4iQ1KeVzXyooYVKtS/u4NkNeFQKmXvXmyJNK0rv8bDN1QLnDa7v4prnXXh2+X\n5KkezirzAgMBAAECggEAL5zLhIaE1fo8wlhVvTd//Jbb3p8gwON57rj7SPU355DG\nHSVKQ2jCCyOi+62/OOd92UnBkA5MKMcUImjomti+HTvEeJG/9cvc92Sw3u5KjOIc\nVj2F/BlJCmPfdOf8wmbWAL2Yul8p3GbyzM1vB9qmDeIIFYwyAQty+lcvyACUopbx\nDAWpaOJAKy/Rv6jb+CXaBtb/axNAp6NJPlr/R0yofAm+536d6Gh2fCP8Abx8v4Wl\nPpPmzGF/4aTLnaDrAfTQnKis0fEf/8LJvX4+pJzptsc4MW2012tW9Umii83U4nYN\nLHs+ylvMIgZpqo/AlMoyl+8AfYhQW9vidOoSOoOM8QKBgQDgCx3XFNYy+/k1BouD\ndq5UDiVImWdraC1gcHGkbTfLoRHtBXIZ1yNxeGCTW8pqF7SI0T8R80rek2iSWE3m\nAik1akZcouU7ja/PYUBkrqoJDl7K7JIj46V8SvGupFmZqHYLEUa94uDFh19UUCh+\nvcxDAC5ArXTlUPXAary19wo65wKBgQDNK7LaazH8Vr/2/8Mu7EsG9rv9j1wawxIV\nZbEVG/Ebqt+OPvnuwrdiLn9EIuNJSfuEwIfWhitDJTwr4IXBitAIqM+9VTfjAMz/\nAEL0SZkJxz3aECNq/doTW1zyQcKHx5gYq0kqcoJT+mRTL6IP1wUOn02uxowIJBoI\nQmQJXIk6FQKBgQDE8OCtNTLJJHe+5d7zk/rQBpM9iyO+5Zelw5IR8LPwOskwKe5P\nyq7sSt3SCwkWU3ouHomrdMrmdnug0SDAxDuHKcFqIwMQY48c46cgGe18AnbPOD+K\nbs0EQjjKxMvCZ7RELE6cEnh1CneA/Olr59lLODhwQEmWXqF4IBt8dQk4FwKBgEb3\nv5TXkWG0bBA25b+8UjNlcx9A0F4dbYrjMv6XPK4SS+O7Gt6gkagvZywdWTsHkS2Z\nHyNwI1TFc2vF7N5GcrEcG0dlS8CEjWQDJiWzs3DzbwyXmniuuBkL+Dl/z5cBzjVy\nQguhsjz0FnHDvy31dTVamxdCbDuAqVSECnBGht0FAoGBAMo/f4olaiXCe/ZpAYvG\nCSo21LJpQcLrgUjlIHLh8JEgN3SYFReV9fuo7/A5Q+BO/HcevBnIZBAz9XucRIFz\nz75LlhhtzKGcUROhDgIxFxiWDQh2krgcO63IOiuHoZeXWhTTDmNTppwuAfguj/ys\nbAHCE9qnnjEXjW54FuzlDm5D\n-----END PRIVATE KEY-----\n",
    }),
  });
}


export const adminDb = getFirestore();
