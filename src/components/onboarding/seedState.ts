// In-memory only — the seed phrase never touches TinyBase persistence.
// Shared across CreateIdentityScreen -> ConfirmSeedScreen for this mockup.
let currentSeed: string[] = [];
let currentCount: 12 | 24 = 12;

export const seedState = {
  set(words: string[], count: 12 | 24) {
    currentSeed = words;
    currentCount = count;
  },
  get() {
    return { words: currentSeed, count: currentCount };
  },
  clear() {
    currentSeed = [];
  },
};

const WORDS = [
  "abacaxi","brisa","cacto","dália","estrela","farol","girassol","horizonte",
  "iris","jasmim","kiwi","luar","montanha","névoa","oceano","pétala",
  "quartzo","raiz","seiva","trilha","urbano","veludo","xadrez","zênite",
];

export function generateMockSeed(count: 12 | 24): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return out;
}