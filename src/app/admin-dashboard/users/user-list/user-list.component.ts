import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { userForm } from '../../../interfaces/userForm';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { user, userResponse, userResponseByID, userSelectedData } from '../../../interfaces/user-response';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-user-list',
  imports: [ CommonModule, ReactiveFormsModule, MatPaginatorModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {

  public userForm = new FormGroup<userForm>({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    contact: new FormControl(null, [Validators.required]),
    address: new FormControl('', Validators.required),
  })
  public userCreateForm: boolean = false;
  public userUpdateForm: boolean = false;
  public users: user[] = [];
  public searchInput = new FormControl('');
  public selectedData = new FormControl('');
  public userId!: number;
  public totalUsers = 0;
  public limit = 5;
  public pageIndex = 0;
  public sortBy: string = 'name';
  public sortDir: string = 'asc';


  constructor(private userService: UserService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getAllUsers()
    this.searchInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      this.searchUser(value)
    })
    this.selectedData.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      console.log(value);
      this.GetSelectedData()
    })
    this.userForm.valueChanges.pipe(debounceTime(500))
  }

  private getAllUsers() {
    const params = {
      searchValue: this.searchInput.value || '',
      page: this.pageIndex + 1,
      limit: this.limit,
      sortBy: this.sortBy || 'name',
      sortDir: this.sortDir || 'asc'
    };
    this.userService.getAllUsers(params).subscribe({
      next: (response: userResponse) => {
        console.log(response);
        this.users = response.users;
        this.totalUsers = response.totalRecords;
        console.log(this.users);
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }

  public userCreatePopUp() {
    this.userCreateForm = !this.userCreateForm;
  }

  public closeUserCreateForm() {
    this.userCreateForm = false;
    this.userForm.reset()
  }

  public createUser() {
    if (this.userForm.valid) {
      this.userService.createUser(this.userForm.value as user).subscribe({
        next: (response) => {
          this.snackBar.open('user create successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          this.closeUserCreateForm();
          this.userForm.reset();
          this.getAllUsers()
        },
        error: (error) => {
          this.snackBar.open(error.error, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
        }
      })
    }
  }

  public deleteUser(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(id).subscribe({
          next: (response) => {
            this.getAllUsers()
            this.snackBar.open('user deleted successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          },
          error: (error) => {
            this.snackBar.open(error.error, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          }
        })
      }
    });
  }

  public showUser(id: number) {
    this.userUpdateForm = !this.userUpdateForm;
    this.userId = id;
    this.userService.getUserById(id).subscribe({
      next: (response: userResponseByID) => {
        this.userForm.setValue({
          name: response.user.name,
          email: response.user.email,
          contact: response.user.contact,
          address: response.user.address
        })
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  public closeUserUpdateForm() {
    this.userUpdateForm = false;
    this.userForm.reset();
  }

  public updateUser() {
    console.log(this.userForm.value);
    if (this.userForm.valid) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { message: 'Are you sure you want to update this user?' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.userService.updateUser(this.userId, this.userForm.value as user).subscribe({
            next: () => {
              this.userForm.reset()
              this.userUpdateForm = false;
              this.snackBar.open('user updated successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
              this.getAllUsers();
            },
            error: (error) => {
              console.log(error);
              this.userUpdateForm = false;
              this.snackBar.open(error.error.message, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
            }
          });
        } else {
          this.userUpdateForm = false;
        }
      });
    }

  }

  // ✅ Sort
  public onSortChange(column: string, direction: 'asc' | 'desc') {
    this.sortBy = column;
    this.sortDir = direction;
    this.getAllUsers();
  }

  // ✅ Pagination
  public onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
    this.getAllUsers();
  }

  // ✅ Search
  public searchUser(value: string | null) {
    if (!value || value.trim() === '') {
      this.getAllUsers();
      return;
    }
    this.getAllUsers();
  }

  public GetSelectedData(){
   if(this.selectedData.value){
    const userSelectedRecords = parseInt(this.selectedData.value)
   this.userService.getSelectedData(userSelectedRecords).subscribe({
    next: (response:userSelectedData)=>{
     this.users = response.userSelectData
    },
    error: (error)=>{
     
    }
    
   })
   }
  }

}


