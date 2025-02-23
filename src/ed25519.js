import { parseSeedPhrase } from 'near-seed-phrase';

const mnemonic = "donkey segment note blush also city humor orchard solution wage miss cycle"; // your seed phrase
const { secretKey, publicKey, seedPhrase } = parseSeedPhrase(mnemonic);

console.log("Seed Phrase:", seedPhrase);
console.log("Public Key:", publicKey); // ed25519:...
console.log("Secret Key:", secretKey); // ed25519:...
