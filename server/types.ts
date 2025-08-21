import 'express-session';

declare module 'express-session' {
  interface SessionData {
    id: string;
  }
}

declare module 'express' {
  interface Request {
    session: {
      id: string;
      regenerate(callback: (err: any) => void): void;
      destroy(callback: (err: any) => void): void;
      reload(callback: (err: any) => void): void;
      save(callback?: (err: any) => void): void;
      touch(): void;
    };
  }
}