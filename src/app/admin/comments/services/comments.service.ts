import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  post_id: number;
  user: { id: number; name: string };
  post?: { id: number; title: string };
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('authToken')!;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAll(): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.apiUrl, { headers: this.headers() });
  }

  get(id: number): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }

  create(data: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, data, { headers: this.headers() });
  }

  update(id: number, data: Partial<Comment>): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, data, { headers: this.headers() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
}
