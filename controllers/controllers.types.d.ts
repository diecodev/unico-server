import { Bson } from '../deps.ts'

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenData {
  _id: Bson.ObjectId;
  role: string;
  isLoggedIn: boolean;
}
