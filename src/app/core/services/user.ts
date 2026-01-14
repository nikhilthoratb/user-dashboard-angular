import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Using BehaviorSubject so new subscribers instantly get latest users
  private usersSubject = new BehaviorSubject<User[]>([
    { name: 'Nikhil Thorat', email: 'nik4@gmail.com', role: 'Viewer' },
  ]);

  // Exposing as observable to avoid accidental mutation
  users$ = this.usersSubject.asObservable();

  addUser(user: User): void {
    // Always create a new array to keep change detection predictable
    const currentUsers = this.usersSubject.getValue();
    this.usersSubject.next([...currentUsers, user]);
  }
}
