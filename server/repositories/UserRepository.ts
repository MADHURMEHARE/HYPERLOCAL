import { USERS, DEFAULT_PASSWORD_HASH } from '../db';
import { User, UserRole } from '../../src/types';
import bcrypt from 'bcryptjs';

export class UserRepository {
  static getAll(): User[] {
    return USERS;
  }

  static findById(id: string): User | undefined {
    return USERS.find(u => u.id === id);
  }

  static findByEmail(email: string): User | undefined {
    return USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  static create(name: string, email: string, passwordHash: string, role: UserRole = 'citizen', ward?: string): User {
    const newId = 'user_' + Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      id: newId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'citizen',
      points: 15,
      badges: ['Community Hero'],
      ward: ward || 'Ward 3 - Mission',
      state: 'California',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150`,
      createdAt: new Date().toISOString(),
      passwordHash
    };
    USERS.push(newUser);
    return newUser;
  }

  static updateRole(userId: string, role: UserRole): User | undefined {
    const user = this.findById(userId);
    if (user) {
      user.role = role;
      if (role === 'officer' && !user.badges.includes('Municipal Officer')) {
        user.badges.push('Municipal Officer');
      } else if (role === 'admin' && !user.badges.includes('City Director')) {
        user.badges.push('City Director');
      }
      return user;
    }
    return undefined;
  }

  static addPoints(userId: string, points: number): void {
    const user = this.findById(userId);
    if (user) {
      user.points = (user.points || 0) + points;
      // Evaluate badge milestones
      if (user.points >= 200 && !user.badges.includes('Top Reporter')) {
        user.badges.push('Top Reporter');
      }
      if (user.points >= 100 && !user.badges.includes('Neighborhood Champion')) {
        user.badges.push('Neighborhood Champion');
      }
    }
  }
}
