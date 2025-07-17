const blake = require('blakejs');

function blake2b256(input) {
    const inputBytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
    const hash = blake.blake2b(inputBytes, null, 32);
    return Buffer.from(hash).toString('hex');
}

const SERIALIZING_HEADER = '05000000c26f887941887839a04632b10553f8b2a7de89c0088abde224b8a0734b0a0000118d8a17bf8fec71a021e1bfeaab44236d05c424dcf22320e96c9504fe6f509599d0d066ffff0f1e500a0400';
const hash = blake2b256(SERIALIZING_HEADER);
console.log('MSG Hash:', hash);

