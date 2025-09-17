import { TokenData } from '@/lib/types/auth.types';

type TokenSubscriber = () => void;

class TokenStore {
  private static instance: TokenStore;
  private subscribers: Set<TokenSubscriber> = new Set();
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'vaultly_refresh_token';
  private readonly EXPIRES_AT_KEY = 'vaultly_expires_at';
  private readonly USER_KEY = 'user_token';

  constructor() {
    // Listen for storage changes to detect external updates
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.ACCESS_TOKEN_KEY) {
          this.notifySubscribers();
        }
      });
    }
  }

  static getInstance(): TokenStore {
    if (!TokenStore.instance) {
      TokenStore.instance = new TokenStore();
    }
    return TokenStore.instance;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  setTokens(tokens: TokenData): void {
    if (!this.isClient()) return;

    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000).getTime();

    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());

    this.notifySubscribers();
  }

  getAccessToken(): string | null {
    if (!this.isClient()) return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (!this.isClient()) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getExpiresAt(): number | null {
    if (!this.isClient()) return null;
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return true;

    // Consider token expired if it expires in the next 5 minutes
    return Date.now() >= (expiresAt - 5 * 60 * 1000);
  }

  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();

    // Simple check for access token (like candor-front)
    return !!accessToken;
  }

  getUser(): any | null {
    if (!this.isClient()) return null;
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  clear(): void {
    if (!this.isClient()) return;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.notifySubscribers();
  }

  subscribe(callback: TokenSubscriber): () => void {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Manual trigger for notifications (to be called when tokens are saved externally)
  triggerUpdate(): void {
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }
}

export const tokenStore = TokenStore.getInstance();