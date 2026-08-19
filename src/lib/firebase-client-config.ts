// Firebase web client configuration is intentionally public. Environment
// variables can override these values for staging or a future Firebase project.
export const firebaseClientConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDnQkBzs4TrTQqgBQT6Xt1xcNFJqx8s51g",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "offsay-e1006.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "offsay-e1006",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:117499389887:web:f6df5550c83789ea35e30a",
};
