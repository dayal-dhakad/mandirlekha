export type Location = 'MANDIR' | 'DHARAMSHALA';
export type EntryType = 'INCOME' | 'EXPENSE' | 'OPENING_BALANCE';
export interface Item { id?: string; description: string; amount: number; paidTo?: string; notes?: string }
export interface Transaction { id: string; location: Location; type: EntryType; date: string; items: Item[]; total: number; createdAt: string }
export interface Summary { income: number; expense: number; openingBalance: number; balance: number }
