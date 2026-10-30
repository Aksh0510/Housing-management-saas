import { mockUsers } from '../data/mockUsers';
import type { User } from '../types/models';

let demoUsers = mockUsers.map((user) => ({ ...user }));

export function getDemoUsers(): User[] {
  return demoUsers.map((user) => ({ ...user }));
}

export function addDemoUser(user: User): User {
  if (demoUsers.some((candidate) => candidate.email.toLocaleLowerCase('en-IN') === user.email.toLocaleLowerCase('en-IN'))) {
    throw new Error('A demo account with this email already exists.');
  }
  demoUsers = [...demoUsers, { ...user }];
  return { ...user };
}

export function resetDemoUsers() {
  demoUsers = mockUsers.map((user) => ({ ...user }));
}

export function authenticateDemoUser(identifier: string): User {
  const normalizedIdentifier = identifier.trim().toLocaleLowerCase('en-IN');
  if (!normalizedIdentifier) throw new Error('Enter the email or mobile number for a demo account.');
  const user = demoUsers.find((candidate) =>
    candidate.email.toLocaleLowerCase('en-IN') === normalizedIdentifier ||
    candidate.mobile === identifier.trim(),
  );
  if (!user) throw new Error('No demo account matches that email or mobile number.');
  return { ...user };
}
