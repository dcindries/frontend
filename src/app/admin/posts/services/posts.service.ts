import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Post {
  id: number;
  content: string;
  image_path?: string;
  created_at: string;
  group_id: number;
  author: { id: number; name: string };
  group?: { id: number; name: string };
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('authToken')!;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /** Listar todas las publicaciones */
  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl, { headers: this.headers() });
  }

  /** Crear publicación */
  create(data: Partial<Post>): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, data, { headers: this.headers() });
  }

  /** Actualizar publicación */
  update(id: number, data: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, data, { headers: this.headers() });
  }

  /** Eliminar publicación */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
}
