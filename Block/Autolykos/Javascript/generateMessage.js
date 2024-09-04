const blake = require('blakejs');

function blake2b256(input) {
    const inputBytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
    const hash = blake.blake2b(inputBytes, null, 32);
    return Buffer.from(hash).toString('hex');
}

const SERIALIZING_HEADER = '05000000750dcadd37aa87e07f692353934bb6f117822a104d6a8a37efbf990100000000cf1c310ead602336e6cc7ab0edde8a24ff4d6da6ebbd6dc68909f71ff8fa4e73ff6fd366cacd0f1ca44a0400';
const hash = blake2b256(SERIALIZING_HEADER);
console.log('MSG Hash:', hash);

