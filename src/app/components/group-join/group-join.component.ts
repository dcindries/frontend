import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupsService } from '../../services/groups.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-join',
  templateUrl: './group-join.component.html',
  styleUrls: ['./group-join.component.css']
})
export class GroupJoinComponent implements OnInit {
  joinForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.joinForm = this.fb.group({
      groupId: ['', Validators.required],
      access_key: [''] // Si el grupo es privado
    });
  }

  onSubmit(): void {
    if (this.joinForm.invalid) {
      return;
    }
    // Lógica para unirse al grupo
    // Por ejemplo, podrías enviar una solicitud al backend para unirte a un grupo
    console.log('Unirse al grupo con datos:', this.joinForm.value);
    // Después de unirse, redirige o actualiza la UI según sea necesario
  }
}
