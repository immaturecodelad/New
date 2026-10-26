const ADJECTIVES = [
  'Curious', 'Clever', 'Quiet', 'Bright', 'Witty', 'Keen', 'Bold', 'Agile',
  'Swift', 'Calm', 'Eager', 'Patient', 'Brave', 'Inquisitive', 'Thoughtful',
  'Creative', 'Wise', 'Gentle', 'Vibrant', 'Inventive', 'Mindful', 'Daring'
];

const ANIMALS = [
  'Panda', 'Owl', 'Falcon', 'Otter', 'Fox', 'Dolphin', 'Badger', 'Lynx',
  'Koala', 'Raven', 'Beaver', 'Penguin', 'Cheetah', 'Hedgehog', 'Sparrow',
  'Bison', 'Hawk', 'Gazelle', 'Chameleon', 'Platypus', 'Lemur', 'Eagle'
];

const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-700',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600'
];

export function generateRandomAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj} ${animal} ${num}`;
}

export function getAliasGradient(alias: string): string {
  let hash = 0;
  for (let i = 0; i < alias.length; i++) {
    hash = alias.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getAliasInitials(alias: string): string {
  const parts = alias.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`;
  }
  return alias.slice(0, 2).toUpperCase();
}
