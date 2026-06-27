import { prisma, runWithFallback } from '../../prisma/prisma-client';
import { User, UserRole } from '../../src/types';
import { USERS } from '../db';

export class UserRepository {
  static async getAll(): Promise<User[]> {
    return runWithFallback(
      async () => {
        const users = await prisma!.user.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return users.map(u => ({
          ...u,
          role: u.role as UserRole,
          createdAt: u.createdAt.toISOString()
        }));
      },
      async () => {
        return USERS;
      }
    );
  }

  static async findById(id: string): Promise<User | null> {
    return runWithFallback(
      async () => {
        const user = await prisma!.user.findUnique({
          where: { id }
        });
        if (!user) return null;
        return {
          ...user,
          role: user.role as UserRole,
          createdAt: user.createdAt.toISOString()
        };
      },
      async () => {
        return USERS.find(u => u.id === id) || null;
      }
    );
  }

  static async findByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.toLowerCase().trim();
    return runWithFallback(
      async () => {
        const user = await prisma!.user.findUnique({
          where: { email: cleanEmail }
        });
        if (!user) return null;
        return {
          ...user,
          role: user.role as UserRole,
          createdAt: user.createdAt.toISOString()
        };
      },
      async () => {
        return USERS.find(u => u.email.toLowerCase() === cleanEmail) || null;
      }
    );
  }

  static async create(name: string, email: string, passwordHash: string, role: UserRole = 'citizen', ward?: string, customId?: string): Promise<User> {
    const newId = customId || ('user_' + Math.random().toString(36).substring(2, 11));
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const defaultWard = ward || 'Ward 3 - Mission';
    const randomAvatar = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150`;

    return runWithFallback(
      async () => {
        const user = await prisma!.user.create({
          data: {
            id: newId,
            name: cleanName,
            email: cleanEmail,
            role: role || 'citizen',
            points: 15,
            badges: ['Community Hero'],
            ward: defaultWard,
            state: 'California',
            avatar: randomAvatar,
            passwordHash
          }
        });

        return {
          ...user,
          role: user.role as UserRole,
          createdAt: user.createdAt.toISOString()
        };
      },
      async () => {
        const newUser: User = {
          id: newId,
          name: cleanName,
          email: cleanEmail,
          role: role || 'citizen',
          points: 15,
          badges: ['Community Hero'],
          ward: defaultWard,
          state: 'California',
          avatar: randomAvatar,
          createdAt: new Date().toISOString(),
          passwordHash
        };
        USERS.push(newUser);
        return newUser;
      }
    );
  }

  static async updateRole(userId: string, role: UserRole): Promise<User | null> {
    return runWithFallback(
      async () => {
        const user = await this.findById(userId);
        if (!user) return null;

        const badges = [...user.badges];
        if (role === 'officer' && !badges.includes('Municipal Officer')) {
          badges.push('Municipal Officer');
        } else if (role === 'admin' && !badges.includes('City Director')) {
          badges.push('City Director');
        }

        const updated = await prisma!.user.update({
          where: { id: userId },
          data: {
            role,
            badges
          }
        });

        return {
          ...updated,
          role: updated.role as UserRole,
          createdAt: updated.createdAt.toISOString()
        };
      },
      async () => {
        const user = USERS.find(u => u.id === userId);
        if (!user) return null;
        user.role = role;
        
        if (role === 'officer' && !user.badges.includes('Municipal Officer')) {
          user.badges.push('Municipal Officer');
        } else if (role === 'admin' && !user.badges.includes('City Director')) {
          user.badges.push('City Director');
        }
        return user;
      }
    );
  }

  static async addPoints(userId: string, points: number): Promise<void> {
    return runWithFallback(
      async () => {
        const user = await this.findById(userId);
        if (!user) return;

        const newPoints = user.points + points;
        const badges = [...user.badges];

        if (newPoints >= 200 && !badges.includes('Top Reporter')) {
          badges.push('Top Reporter');
        }
        if (newPoints >= 100 && !badges.includes('Neighborhood Champion')) {
          badges.push('Neighborhood Champion');
        }

        await prisma!.user.update({
          where: { id: userId },
          data: {
            points: newPoints,
            badges
          }
        });
      },
      async () => {
        const user = USERS.find(u => u.id === userId);
        if (!user) return;

        user.points += points;
        if (user.points >= 200 && !user.badges.includes('Top Reporter')) {
          user.badges.push('Top Reporter');
        }
        if (user.points >= 100 && !user.badges.includes('Neighborhood Champion')) {
          user.badges.push('Neighborhood Champion');
        }
      }
    );
  }

  static async updatePassword(email: string, passwordHash: string): Promise<User | null> {
    const cleanEmail = email.toLowerCase().trim();
    return runWithFallback(
      async () => {
        const user = await this.findByEmail(cleanEmail);
        if (!user) return null;

        const updated = await prisma!.user.update({
          where: { id: user.id },
          data: { passwordHash }
        });

        return {
          ...updated,
          role: updated.role as UserRole,
          createdAt: updated.createdAt.toISOString()
        };
      },
      async () => {
        const user = USERS.find(u => u.email.toLowerCase() === cleanEmail);
        if (!user) return null;
        user.passwordHash = passwordHash;
        return user;
      }
    );
  }
}
