import { Component, OnInit }    from '@angular/core';
import { Router }               from '@angular/router';
import { GroupsService, Group} from '../services/groups.service';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.component.html',

})
export class ListGroupsComponent implements OnInit {
  groups: Group[] = [];
  error = '';

  constructor(
    private groupsService: GroupsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.groupsService.getAll().subscribe({
      next: (data: Group[]) => this.groups = data,
      error: ()            => this.error = 'Error al cargar grupos.'
    });
  }

  editGroup(id: number): void {
    this.router.navigate(['/admin/groups/edit', id]);
  }

  deleteGroup(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar este grupo?')) return;
    this.groupsService.delete(id).subscribe({
      next: () => this.loadGroups(),
      error: () => this.error = 'Error al eliminar grupo.'
    });
  }
}
