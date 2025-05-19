// src/app/services/posts.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Post {
  id: number;
  content: string;
  image_path?: string;
  created_at: string;
  group_id: number;
  author: { id: number; name: string };
  group?: { id: number; name: string };
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private baseUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  /** Construye los headers con auth token */
  private headers(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /** Obtiene todos los posts (admin o públicos según backend) */
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl, { headers: this.headers() });
  }

  /** Obtiene los posts de un grupo específico */
  getPostsByGroup(groupId: number): Observable<Post[]> {
    return this.http.get<Post[]>(
      `${this.baseUrl}?group_id=${groupId}`,
      { headers: this.headers() }
    );
  }

  /** Crea un nuevo post (envía FormData con posible imagen) */
  createPost(postData: FormData): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, postData, { headers: this.headers() });
  }

  /** Actualiza un post existente */
  updatePost(id: number, postData: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(
      `${this.baseUrl}/${id}`,
      postData,
      { headers: this.headers() }
    );
  }

  /** Elimina un post */
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`,
      { headers: this.headers() }
    );
  }
}
