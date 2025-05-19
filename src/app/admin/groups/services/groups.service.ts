import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Interfaz que representa un grupo en la interfaz de administración.
 */
export interface Group {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  created_by?: number;
}

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private apiUrl = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) {}

  /** Obtiene todos los grupos (admin) */
  getAll(): Observable<Group[]> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Group[]>(this.apiUrl, { headers });
  }

  /** Crea un nuevo grupo */
  create(group: Partial<Group>): Observable<Group> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Group>(this.apiUrl, group, { headers });
  }

  /** Actualiza un grupo existente */
  update(id: number, group: Partial<Group>): Observable<Group> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Group>(`${this.apiUrl}/${id}`, group, { headers });
  }

  /** Elimina un grupo */
  delete(id: number): Observable<void> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
