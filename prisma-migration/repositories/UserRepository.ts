import { prisma } from '../../prisma/prisma-client';
import { User, UserRole } from '../../src/types';

export class UserRepository {
  static async getAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return users.map(u => ({
      ...u,
      role: u.role as UserRole,
      createdAt: u.createdAt.toISOString()
    }));
  }

  static async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) return null;
    return {
      ...user,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString()
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (!user) return null;
    return {
      ...user,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString()
    };
  }

  static async create(name: string, email: string, passwordHash: string, role: UserRole = 'citizen', ward?: string): Promise<User> {
    const newId = 'user_' + Math.random().toString(36).substring(2, 11);
    const user = await prisma.user.create({
      data: {
        id: newId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role || 'citizen',
        points: 15,
        badges: ['Community Hero'],
        ward: ward || 'Ward 3 - Mission',
        state: 'California',
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150`,
        passwordHash
      }
    });

    return {
      ...user,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString()
    };
  }

  static async updateRole(userId: string, role: UserRole): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const badges = [...user.badges];
    if (role === 'officer' && !badges.includes('Municipal Officer')) {
      badges.push('Municipal Officer');
    } else if (role === 'admin' && !badges.includes('City Director')) {
      badges.push('City Director');
    }

    const updated = await prisma.user.update({
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
  }

  static async addPoints(userId: string, points: number): Promise<void> {
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

    await prisma.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
        badges
      }
    });
  }
}
