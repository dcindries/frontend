import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupsService } from '../../services/groups.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.component.html',
  styleUrls: ['./group-create.component.css']
})
export class GroupCreateComponent implements OnInit {
  groupForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      is_public: [true, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.groupForm.invalid) {
      this.errorMessage = 'Por favor, complete el nombre del grupo.';
      return;
    }
    this.groupsService.createGroup(this.groupForm.value).subscribe({
      next: (res) => {
        console.log('Grupo creado:', res);
        this.router.navigate(['/groups']);
      },
      error: (err) => {
        console.error('Error al crear grupo:', err);
        this.errorMessage = err.error?.message || 'Error al crear el grupo.';
      }
    });
  }
}
