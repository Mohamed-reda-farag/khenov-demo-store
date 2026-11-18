import { simulateNetwork } from '@/lib/demo/network';
import { registerSeeder } from '@/lib/demo/seed';
import { storage } from '@/lib/demo/storage';
import type { NewsletterRepository } from './newsletter';

const KEY = 'newsletter';

registerSeeder(() => {
  storage.set<string[]>(KEY, []);
});

export const localNewsletterRepository: NewsletterRepository = {
  async subscribe(email) {
    await simulateNetwork(300, 700);
    const normalized = email.trim().toLowerCase();
    const emails = storage.get<string[]>(KEY, []);
    if (emails.includes(normalized)) return { alreadySubscribed: true };
    storage.set(KEY, [...emails, normalized]);
    return { alreadySubscribed: false };
  },
};
