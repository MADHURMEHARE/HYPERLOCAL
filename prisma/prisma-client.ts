import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export let prisma: PrismaClient | null = null;
export let isPrismaActive = false;

function isValidDatabaseUrl(urlStr: string | undefined): boolean {
  if (!urlStr || urlStr.trim() === '') return false;
  
  const trimmed = urlStr.trim();
  
  // Basic protocol check
  if (!trimmed.startsWith('postgresql://') && !trimmed.startsWith('postgres://')) {
    return false;
  }

  // Check for obvious placeholders
  if (trimmed.includes('<') || trimmed.includes('>') || trimmed.includes('{') || trimmed.includes('}')) {
    return false;
  }
  if (trimmed.includes('placeholder') || trimmed.includes('TODO') || trimmed.includes('YOUR_')) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    
    // Check for invalid ports
    if (parsed.host.includes(':')) {
      const parts = parsed.host.split(':');
      const portPart = parts[parts.length - 1];
      if (portPart) {
        // Remove query parameters if any are attached to the port in edge cases
        const cleanPort = portPart.split('/')[0].split('?')[0];
        const portNum = parseInt(cleanPort, 10);
        if (isNaN(portNum) || portNum <= 0 || portNum > 65535 || String(portNum) !== cleanPort) {
          return false;
        }
      }
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

try {
  const dbUrl = process.env.DATABASE_URL;
  if (isValidDatabaseUrl(dbUrl)) {
    prisma = global.prisma || new PrismaClient({
      log: ['error'],
    });
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prisma;
    }
    isPrismaActive = true;
    console.log('🔌 Prisma Client successfully initialized.');
  } else {
    console.log('⚠️ DATABASE_URL is invalid or not defined. Prisma is disabled, using in-memory fallback.');
    // Clear the environment variable so Prisma Client (if instantiated elsewhere) doesn't try to parse it
    process.env.DATABASE_URL = '';
    isPrismaActive = false;
  }
} catch (err) {
  console.error('❌ Failed to initialize Prisma Client:', err);
  isPrismaActive = false;
}

// Global flag to track if the database is actually reachable
let isDbOnline = true;

export function setDbOffline() {
  if (isDbOnline) {
    console.log('🚨 Database connection failed. Falling back to in-memory mode.');
    isDbOnline = false;
  }
}

export function setDbOnline() {
  if (!isDbOnline) {
    console.log('🟢 Database connection restored.');
    isDbOnline = true;
  }
}

export function isDatabaseEnabled(): boolean {
  return !!prisma && isPrismaActive && isDbOnline;
}

/**
 * Executes a Prisma query and falls back to an in-memory operation if the database is offline/unreachable.
 */
export async function runWithFallback<T>(dbQuery: () => Promise<T>, memoryFallback: () => Promise<T> | T): Promise<T> {
  if (!isDatabaseEnabled()) {
    return memoryFallback();
  }

  try {
    return await dbQuery();
  } catch (error: any) {
    const errStr = String(error.message || error);
    const isConnectionError = 
      errStr.includes('P1001') || 
      errStr.includes('P1002') || 
      errStr.includes('P1003') ||
      errStr.includes('P2021') ||
      errStr.includes('P2022') ||
      errStr.includes('does not exist') ||
      errStr.includes('relation') ||
      errStr.includes('table') ||
      errStr.includes('Can\'t reach database') ||
      errStr.includes('Connection refused') ||
      errStr.includes('timed out') ||
      errStr.includes('database server at');

    if (isConnectionError) {
      setDbOffline();
      return memoryFallback();
    }

    throw error;
  }
}
