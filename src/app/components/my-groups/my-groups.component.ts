import { Component, OnInit } from '@angular/core';
import { GroupsService } from '../../services/groups.service';

@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.component.html',
  styleUrls: ['./my-groups.component.css']
})
export class MyGroupsComponent implements OnInit {
  myGroups: any[] = [];
  errorMessage: string = '';

  constructor(private groupsService: GroupsService) { }

  ngOnInit(): void {
    this.fetchMyGroups();
  }

  fetchMyGroups(): void {
    this.groupsService.getMyGroups().subscribe({
      next: (res) => {
        this.myGroups = res;
        console.log('Mis grupos:', this.myGroups);
      },
      error: (err) => {
        console.error('Error al cargar mis grupos:', err);
        this.errorMessage = 'No se pudieron cargar tus grupos.';
      }
    });
  }
}
