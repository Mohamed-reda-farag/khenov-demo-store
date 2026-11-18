export interface NewsletterRepository {
  /** Demo only: the address is kept on this device and nothing is ever sent. */
  subscribe(email: string): Promise<{ alreadySubscribed: boolean }>;
}
