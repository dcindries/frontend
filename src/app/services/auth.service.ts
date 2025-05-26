import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  is_admin?: boolean;
  profile_photo_url?: string;
  updated_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  private _currentUser = new BehaviorSubject<User | null>(null);
  public currentUser$ = this._currentUser.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this._isAuthenticated.next(true);
      this.getUser().subscribe();
    }
  }

  /** Helper to build auth headers */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken')!;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /** Fetch current user */
  public getUser(): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/user`, {
        headers: this.getAuthHeaders(),
        observe: 'body' as const,
      })
      .pipe(
        tap(user => {
          this._currentUser.next(user);
          this._isAuthenticated.next(true);
        }),
        catchError(err => {
          this.clearSession();
          return throwError(() => err);
        })
      );
  }

  /**
   * Register.
   * Accepts either raw JSON ({name,email,password})
   * or FormData (e.g. with profile photo).
   */
  public register(
    payload:
      | { name: string; email: string; password: string }
      | FormData
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/register`, payload, {
        observe: 'body' as const,
      })
      .pipe(tap(res => this.setSession(res)));
  }

  /** Login */
  public login(credentials: {
    email: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials, {
        observe: 'body' as const,
      })
      .pipe(tap(res => this.setSession(res)));
  }

  /** Logout (server + client) */
  public logout(): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/logout`, {
        headers: this.getAuthHeaders(),
        observe: 'body' as const,
      })
      .pipe(tap(() => this.clearSession()));
  }

  /**
   * Update profile.
   * Accepts either JSON or FormData.
   */
  public updateProfile(
    payload: { name?: string; email?: string } | FormData
  ): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/user`, payload, {
        headers: this.getAuthHeaders(),
        observe: 'body' as const,
      })
      .pipe(tap(u => this._currentUser.next(u)));
  }

  /** Alias for the old name */
  public updateProfilePost(data: FormData | { name?: string; email?: string }) {
    return this.updateProfile(data);
  }

  /** Synchronous getter */
  public get isLoggedIn(): boolean {
    return this._isAuthenticated.value;
  }

  /** Internal: stash token + user */
  private setSession(res: LoginResponse) {
    localStorage.setItem('authToken', res.access_token);
    this._isAuthenticated.next(true);
    this._currentUser.next(res.user);
  }

  /** Internal: clear everything */
  private clearSession() {
    localStorage.removeItem('authToken');
    this._isAuthenticated.next(false);
    this._currentUser.next(null);
  }
}
