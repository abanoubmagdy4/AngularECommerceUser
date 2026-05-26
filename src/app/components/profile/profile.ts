import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProfileDto } from '../../models/IAccount';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = true;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
    });

    this.loadProfile();
  }

  loadProfile() {
    this.http
      .get<ProfileDto>('https://localhost:port/api/Auth/GetProfileById')
      .subscribe({
        next: (data) => {
          this.profileForm.patchValue({
            ...data,
            dateOfBirth: data.dateOfBirth?.substring(0, 10),
          });
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    const updatedData = this.profileForm.getRawValue();

    this.http
      .put('https://localhost:port/api/Auth/UpdateProfile', updatedData)
      .subscribe({
        next: () => {
          alert(this.translate.instant('PROFILE.UPDATE_SUCCESS'));
          this.isSaving = false;
        },
        error: (err) => {
          alert(this.translate.instant('PROFILE.UPDATE_ERROR'));
          this.isSaving = false;
        },
      });
  }
}
