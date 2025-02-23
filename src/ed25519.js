import { parseSeedPhrase } from 'near-seed-phrase';

const mnemonic = "hard kitten stomach defy exhibit attract drum forget grow struggle session action"; // your seed phrase
const { secretKey, publicKey, seedPhrase } = parseSeedPhrase(mnemonic);

console.log("Seed Phrase:", seedPhrase);
console.log("Public Key:", publicKey); // ed25519:...
console.log("Secret Key:", secretKey); // ed25519:...
