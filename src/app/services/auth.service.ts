
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
      this.fetchUserOnStart();
    }
  }

  private fetchUserOnStart(): void {
    this.getUser()
      .pipe(
        tap(user => this._currentUser.next(user)),
        catchError(err => {
          localStorage.removeItem('authToken');
          this._isAuthenticated.next(false);
          this._currentUser.next(null);
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  public getUser(): Observable<User> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/user`, { headers }).pipe(
      tap(user => {
        this._currentUser.next(user);
        this._isAuthenticated.next(true);
      })
    );
  }

  public register(formData: FormData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, formData).pipe(
      tap(res => {
        localStorage.setItem('authToken', res.access_token);
        this._isAuthenticated.next(true);
        this._currentUser.next(res.user);
      })
    );
  }

  public login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('authToken', res.access_token);
        this._isAuthenticated.next(true);
        this._currentUser.next(res.user);
      })
    );
  }

  public logout(): Observable<any> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${this.apiUrl}/logout`, { headers }).pipe(
      tap(() => {
        localStorage.removeItem('authToken');
        this._isAuthenticated.next(false);
        this._currentUser.next(null);
      })
    );
  }

  public updateProfilePost(data: FormData): Observable<User> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<User>(`${this.apiUrl}/user`, data, {
      headers,
      withCredentials: true
    }).pipe(
      tap(user => this._currentUser.next(user))
    );
  }

  public setCurrentUser(user: User): void {
    this._currentUser.next(user);
  }

  public get isLoggedIn(): boolean {
    return this._isAuthenticated.value;
  }

  public setAuthentication(value: boolean): void {
    this._isAuthenticated.next(value);
  }
}
