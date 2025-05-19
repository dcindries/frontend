// src/app/services/groups.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getGroups(): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups`);
  }

  getGroupById(id: number): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/groups/${id}`, { headers });
  }

  createGroup(groupData: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/groups`, groupData, { headers });
  }

  joinGroup(groupId: number, data: any = {}): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/groups/${groupId}/join`, data, { headers });
  }

  leaveGroup(groupId: number, data: any = {}): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/groups/${groupId}/leave`, data, { headers });
  }

  getMyGroups(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/my-groups`, { headers });
  }

  getMyPrivateGroups(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/my-private-groups`, { headers });
  }

  // ✨ Nuevo: unirse directamente por código sin seleccionar grupo
  joinByCode(accessKey: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(
      `${this.apiUrl}/groups/join-by-code`,
      { access_key: accessKey },
      { headers }
    );
  }


  searchGroups(term: string = '') {
    const q = term.trim();
    return this.http.get<any[]>(
      `${this.apiUrl}/groups${ q ? '?search='+encodeURIComponent(q) : '' }`
    );
  }
  
}
