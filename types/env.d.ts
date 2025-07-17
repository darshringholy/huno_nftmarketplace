declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PINATA_JWT: string;
      NEXT_PUBLIC_PINATA_JWT: string;
    }
  }
}

export {}; 