// Database disabled stub. Provides a minimal shape to satisfy imports.
type Any = any;
function readJson<T = Any>(path: string, fallback: T): T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(path) as T;
  } catch {
    return fallback;
  }
}

export const prisma = {
  menuItem: {
    async findMany(_args?: Any) {
      const data = readJson<any[]>('../../public/data/menu.json', []);
      return data.filter((m) => m.isActive !== false);
    }
  },
  menuItemDraft: {
    async findMany(_args?: Any) {
      const data = readJson<any[]>('../../public/data/menu.json', []);
      return data;
    },
    async upsert(_args: Any) {
      throw new Error('DB disabled');
    },
    async findUnique(_args: Any) {
      return null;
    }
  },
  heroSlide: {
    async findMany(_args?: Any) {
      const data = readJson<any[]>('../../public/data/hero.json', []);
      return data;
    }
  },
  settings: {
    async findUnique(_args?: Any) {
      return null;
    }
  },
  changeLog: {
    async findMany(_args?: Any) {
      return [] as Any[];
    },
    async create(_args: Any) {
      return { id: 'disabled' } as Any;
    }
  },
  user: {
    async findUnique(_args?: Any) { return null; },
    async update(_args?: Any) { throw new Error('DB disabled'); }
  }
} as const;
