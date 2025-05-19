import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.authHeaders() });
  }

  get(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }

  create(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, user, { headers: this.authHeaders() });
  }

update(id: number, user: any): Observable<any> {
  const headers = this.authHeaders();
  if (user instanceof FormData) {
    user.append('_method', 'PUT');
    return this.http.post<any>(
      `${this.apiUrl}/${id}`,
      user,
      { headers }
    );
  }
  return this.http.put<any>(
    `${this.apiUrl}/${id}`,
    user,
    { headers }
  );}

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }
}
