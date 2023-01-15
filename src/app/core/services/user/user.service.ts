import { Injectable, OnInit } from '@angular/core';
import { User } from '../../../../assets';
import { StoreService } from '../store/store.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _admin: boolean;
  private _currentUser: User;
  private _users: User[] = [];

  constructor(
    private readonly storeService: StoreService,
    private readonly authService: AuthService
  ) {
    this.admin = true;
  }
  //login operations
  public async login(user: Partial<User>) {
    try {
      this.currentUser = await this.authService.localLogin(user);
    } catch {}
  }
  //Crud Operations for User
  public async readAll() {
    this._users = await this.storeService.find(User.name);
    console.log(this._users);
  }
  public async readOne(
    user: Partial<User> &
      (Pick<User, 'email'> | Pick<User, 'username'> | Pick<User, 'id'>)
  ) {
    return await this.storeService.findOneBy(User.name, user);
  }
  public async create(
    user: Partial<User> &
      Pick<User, 'firstName' | 'lastName' | 'username' | 'email' | 'password'>
  ) {
    return await this.storeService.create(User.name, user);
  }

  public async update(id: number, user: Partial<User>) {
    return await this.storeService.update(id, User.name, user);
  }
  public async delete(
    user: Partial<User> &
      (Pick<User, 'email'> | Pick<User, 'username'> | Pick<User, 'id'>)
  ) {
    return await this.storeService.remove(User.name, user);
  }

  //getters
  get admin() {
    return this._admin;
  }
  get users() {
    return this._users;
  }
  get currentUser() {
    return this._currentUser;
  }

  //setters
  private set admin(v: boolean) {
    this._admin = v;
  }
  private set currentUser(user: User) {
    this._currentUser = user;
  }
}
