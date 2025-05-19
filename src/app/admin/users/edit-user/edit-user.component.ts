import { Component, OnInit }        from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router }   from '@angular/router';
import { UsersService }             from '../services/user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
})
export class EditUserComponent implements OnInit {
  form!: FormGroup;
  id!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.usersService.get(this.id).subscribe({
      next: data => this.form.patchValue(data),
      error: (err: any) => console.error('Error loading user:', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.usersService.update(this.id, this.form.value).subscribe({
      next: () => this.router.navigate(['/admin/users']),
      error: (err: any) => console.error('Error updating user:', err)
    });
  }
}
