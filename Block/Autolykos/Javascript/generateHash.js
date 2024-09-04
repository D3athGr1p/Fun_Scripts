const blake2 = require('blake2');
const BigIntBuffer = require('bigint-buffer');
const uint64be = require('uint64be');

const M = Buffer.concat(Array(1024).fill().map((_, i) => uint64be.encode(i)));

const NBase = BigInt(Math.pow(2, 26));
const IncreaseStart = 600 * 1024;
const IncreasePeriodForN = 50 * 1024;
const NIncreasementHeightMax = 4198400;

const N = (height) => {
    height = Math.min(NIncreasementHeightMax, height);
    if (height < IncreaseStart) {
        return NBase;
    } else if (height >= NIncreasementHeightMax) {
        return 2147387550;
    } else {
        let res = NBase;
        const iterationsNumber = Math.floor((height - IncreaseStart) / IncreasePeriodForN) + 1;
        for (let i = 0; i < iterationsNumber; i++) {
            res = res / BigInt(100) * BigInt(105);
        }
        return res;
    }
};

function blake2b(seed) {
    const h = blake2.createHash('blake2b', { digestLength: 32 });
    h.update(seed);
    return h.digest();
}

function genIndexes(seed, height) {
    const hash = blake2b(seed);
    const extendedHash = Buffer.concat([hash, hash]); // Use Buffer instead of Uint8Array
    return Array.from({ length: 32 }).map((_, index) => extendedHash.readUIntBE(index, 4) % parseInt(N(height)));
}

function autolykos2_hashes(coinbaseBuffer, height) {
    const h = BigIntBuffer.toBufferBE(BigInt(height), 4);
    const i = BigIntBuffer.toBufferBE(BigIntBuffer.toBigIntBE(blake2b(coinbaseBuffer).slice(24, 32)) % BigInt(N(height)), 4);
    const e = blake2b(Buffer.concat([i, h, M])).slice(1, 32);
    const J = genIndexes(Buffer.concat([e, coinbaseBuffer]), height).map((item) => BigIntBuffer.toBufferBE(BigInt(item), 4));
    const f = J.map((item) => BigIntBuffer.toBigIntBE(blake2b(Buffer.concat([item, h, M])).slice(1, 32))).reduce((a, b) => a + b);
    const hash = BigIntBuffer.toBufferBE(f, 32);

    return [hash, blake2b(hash)];
}

// reverse nonce

const input_hex = "90a26d63579a13ce5b27a3bbe127c99ac280376785060ff76ca2f8efaf15eb37fa7030ed181f2ddf";
const height = 281252;

const buf = Buffer.from(input_hex, 'hex');

const hashes = autolykos2_hashes(buf, height);
console.log(hashes[0].toString('hex'));
console.log(hashes[1].toString('hex'));
