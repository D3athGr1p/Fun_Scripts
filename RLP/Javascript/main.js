
function hexToBytes(hex) {
    if (typeof hex !== 'string') {
        throw new TypeError('hexToBytes: expected string, got ' + typeof hex)
    }
    if (hex.length % 2) throw new Error('hexToBytes: received invalid unpadded hex')
    const array = new Uint8Array(hex.length / 2)
    for (let i = 0; i < array.length; i++) {
        const j = i * 2
        array[i] = parseHexByte(hex.slice(j, j + 2))
    }
    return array
}

function isHexPrefixed(str) {
    return str.length >= 2 && str[0] === '0' && str[1] === 'x'
}

function padToEven(a) {
    return a.length % 2 ? `0${a}` : a
}

function stripHexPrefix(str) {
    if (typeof str !== 'string') {
        return str
    }
    return isHexPrefixed(str) ? str.slice(2) : str
}

function utf8ToBytes(utf) {
    return new TextEncoder().encode(utf)
}

function numberToHex(integer) {
    if (integer < 0) {
        throw new Error('Invalid integer as argument, must be unsigned!')
    }
    const hex = integer.toString(16)
    return hex.length % 2 ? `0${hex}` : hex
}

function toBytes(v) {
    if (v instanceof Uint8Array) {
        return v
    }
    if (typeof v === 'string') {
        if (isHexPrefixed(v)) {
            return hexToBytes(padToEven(stripHexPrefix(v)))
        }
        return utf8ToBytes(v)
    }
    if (typeof v === 'number' || typeof v === 'bigint') {
        if (!v) {
            return Uint8Array.from([])
        }
        return hexToBytes(numberToHex(v))
    }
    if (v === null || v === undefined) {
        return Uint8Array.from([])
    }
    throw new Error('toBytes: received unsupported type ' + typeof v)
}

function _decode(input) {
    let length, llength, data, innerRemainder, d
    const decoded = []
    const firstByte = input[0]

    if (firstByte <= 0x7f) {
        // a single byte whose value is in the [0x00, 0x7f] range, that byte is its own RLP encoding.
        return {
            data: input.slice(0, 1),
            remainder: input.slice(1),
        }
    } else if (firstByte <= 0xb7) {
        // string is 0-55 bytes long. A single byte with value 0x80 plus the length of the string followed by the string
        // The range of the first byte is [0x80, 0xb7]
        length = firstByte - 0x7f

        // set 0x80 null to 0
        if (firstByte === 0x80) {
            data = Uint8Array.from([])
        } else {
            data = safeSlice(input, 1, length)
        }

        if (length === 2 && data[0] < 0x80) {
            throw new Error('invalid RLP encoding: invalid prefix, single byte < 0x80 are not prefixed')
        }

        return {
            data,
            remainder: input.slice(length),
        }
    } else if (firstByte <= 0xbf) {
        // string is greater than 55 bytes long. A single byte with the value (0xb7 plus the length of the length),
        // followed by the length, followed by the string
        llength = firstByte - 0xb6
        if (input.length - 1 < llength) {
            throw new Error('invalid RLP: not enough bytes for string length')
        }
        length = decodeLength(safeSlice(input, 1, llength))
        if (length <= 55) {
            throw new Error('invalid RLP: expected string length to be greater than 55')
        }
        data = safeSlice(input, llength, length + llength)

        return {
            data,
            remainder: input.slice(length + llength),
        }
    } else if (firstByte <= 0xf7) {
        // a list between 0-55 bytes long
        length = firstByte - 0xbf
        innerRemainder = safeSlice(input, 1, length)
        while (innerRemainder.length) {
            d = _decode(innerRemainder)
            decoded.push(d.data)
            innerRemainder = d.remainder
        }

        return {
            data: decoded,
            remainder: input.slice(length),
        }
    } else {
        // a list over 55 bytes long
        llength = firstByte - 0xf6
        length = decodeLength(safeSlice(input, 1, llength))
        if (length < 56) {
            throw new Error('invalid RLP: encoded list too short')
        }
        const totalLength = llength + length
        console.log("input::: ", input.length, length)
        if (totalLength > input.length) {
            throw new Error('invalid RLP: total length is larger than the data')
        }

        innerRemainder = safeSlice(input, llength, totalLength)

        while (innerRemainder.length) {
            d = _decode(innerRemainder)
            decoded.push(d.data)
            innerRemainder = d.remainder
        }

        return {
            data: decoded,
            remainder: input.slice(totalLength),
        }
    }
}

function safeSlice(input, start, end) {
    if (end > input.length) {
        throw new Error('invalid RLP (safeSlice): end slice of Uint8Array out-of-bounds')
    }
    return input.slice(start, end)
}

function decodeLength(v) {
    if (v[0] === 0) {
        throw new Error('invalid RLP: extra zeros')
    }
    return parseHexByte(bytesToHex(v))
}

function parseHexByte(hexByte) {
    const byte = Number.parseInt(hexByte, 16)
    if (Number.isNaN(byte)) throw new Error('Invalid byte sequence')
    return byte
}

function bytesToHex(uint8a) {
    // Pre-caching chars with `cachedHexes` speeds this up 6x
    let hex = ''
    for (let i = 0; i < uint8a.length; i++) {
        hex += cachedHexes[uint8a[i]]
    }
    return hex
}

function encodeLength(len, offset) {
    if (len < 56) {
        return Uint8Array.from([len + offset])
    }
    const hexLength = numberToHex(len)
    const lLength = hexLength.length / 2
    const firstByte = numberToHex(offset + 55 + lLength)
    return Uint8Array.from(hexToBytes(firstByte + hexLength))
}

const cachedHexes = Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, '0'))

function concatBytes(...arrays) {
    if (arrays.length === 1) return arrays[0]
    const length = arrays.reduce((a, arr) => a + arr.length, 0)
    const result = new Uint8Array(length)
    for (let i = 0, pad = 0; i < arrays.length; i++) {
      const arr = arrays[i]
      result.set(arr, pad)
      pad += arr.length
    }
    return result
  }

function decode(input, stream = false) {
    if (typeof input === 'undefined' || input === null || (input).length === 0) {
        return Uint8Array.from([])
    }

    const inputBytes = toBytes(input)
    const decoded = _decode(inputBytes)

    if (stream) {
        return decoded
    }
    if (decoded.remainder.length !== 0) {
        throw new Error('invalid RLP: remainder must be zero')
    }

    return decoded.data
}

function encode(input) {
    if (Array.isArray(input)) {
        const output = []
        let outputLength = 0
        for (let i = 0; i < input.length; i++) {
            const encoded = encode(input[i])
            output.push(encoded)
            outputLength += encoded.length
        }
        return concatBytes(encodeLength(outputLength, 192), ...output)
    }
    const inputBuf = toBytes(input)
    if (inputBuf.length === 1 && inputBuf[0] < 128) {
        return inputBuf
    }
    return concatBytes(encodeLength(inputBuf.length, 128), inputBuf)
}

function formatOutput(decoded) {
    const [nonce, gasPrice, gasLimit, to, value, data, v, r, s] = decoded;
    return {
        nonce: parseInt(bytesToHex(nonce), 16),
        gasPrice: parseInt(bytesToHex(gasPrice), 16),
        gasLimit: parseInt(bytesToHex(gasLimit), 16),
        to: '0x' + bytesToHex(to),
        value: parseInt(bytesToHex(value), 16),
        data: bytesToHex(data),
        v: bytesToHex(v),
        r: '0x' + bytesToHex(r),
        s: '0x' + bytesToHex(s),
    };
}


function formatOutputInArray(decoded) {
    const [nonce, gasPrice, gasLimit, to, value, data, v, r, s] = decoded;
    return [
        parseInt(bytesToHex(nonce), 16),
        parseInt(bytesToHex(gasPrice), 16),
        parseInt(bytesToHex(gasLimit), 16),
        '0x' + bytesToHex(to),
        parseInt(bytesToHex(value), 16),
        bytesToHex(data),
        bytesToHex(v),
        '0x' + bytesToHex(r),
        '0x' + bytesToHex(s),
    ];
}

var trimLeadingZero = function (hex) {
    while (hex && hex.startsWith('0x00')) {
        hex = '0x' + hex.slice(4);
    }
    return hex;
}

const decodedArray = decode("0xf9036c82015184b2d05e008303d09094104098ebe294fa1db89f1c8fef4e8c8eb8ba7b8580b90304884dad2e000000000000000000000000d38d26954c4a8087358b8d698fe5e3255c5aecea0000000000000000000000000000000000000000000000001e87f85809dc00000000000000000000000000000000000000000000000000002195912da4720000000000000000000000000000000000000000000000000000063eb89da4ed0000020000120b65d7700000000000001d0d678e2593668c000000000000000000001c0000000000000000000000000000000000000000000000000000000000000056cc6bf25bf5ac0616082c9c33e7662de160dc32b1e8d965589be9d7824bf4e158a7f784203c0f1969af8eb65498de555967b6ab5e684ded91cf57285277cc0c00000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000005a0212daacbbdf2baabec3fe6932911bd49e1d770000000000000000000000008f8e04fca018877f488fc0503bc6134d680fd6c000000000000000000000000032133c92983d78ed7193ee4d0f719c578ff5993b0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000e96a37edde26a456a0c6f90a5f1b81a40a0f10320000000000000000000000000000000000000000000000001e87f85809dc00000000000000000000000000000000000000000000000000002195912da4720000000000000000000000000000000000000000000000000000063eb89da4ed0000020100120b65a1e0000000000000737c2e7be80f6700000000000000000000001b0000000000000000000000000000000000000000000000000000000000000021c9e563974c365ea5823fa92d76435930ca73b176ae900d6a0c706b2a571a2f79d8aa4bafc92f031d5250599823793364506c5518344076b618083c0ff82ccc00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000001e87f85809dc00001ca0000f9b197d866428b19c7aa5dfd1d9e361b1d19742dd3f1b583ff6c451034334a06471f630fc4b521824b4f12bf1ca79e7fd9a826331b525d53454fc09678b179b");
// const decodedArray = decode("0xf9036c82015184b2d05e008303d09094104098ebe294fa1db89f1c8fef4e8c8eb8ba7b8580b90304884dad2e000000000000000000000000d38d26954c4a8087358b8d698fe5e3255c5aecea0000000000000000000000000000000000000000000000001e87f85809dc00000000000000000000000000000000000000000000000000002195912da4720000000000000000000000000000000000000000000000000000063eb89da4ed0000020000120b65d7700000000000001d0d678e2593668c000000000000000000001c0000000000000000000000000000000000000000000000000000000000000056cc6bf25bf5ac0616082c9c33e7662de160dc32b1e8d965589be9d7824bf4e158a7f784203c0f1969af8eb65498de555967b6ab5e684ded91cf57285277cc0c00000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000005a0212daacbbdf2baabec3fe6932911bd49e1d770000000000000000000000008f8e04fca018877f488fc0503bc6134d680fd6c000000000000000000000000032133c92983d78ed7193ee4d0f719c578ff5993b0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000e96a37edde26a456a0c6f90a5f1b81a40a0f10320000000000000000000000000000000000000000000000001e87f85809dc00000000000000000000000000000000000000000000000000002195912da4720000000000000000000000000000000000000000000000000000063eb89da4ed0000020100120b65a1e0000000000000737c2e7be80f6700000000000000000000001b0000000000000000000000000000000000000000000000000000000000000021c9e563974c365ea5823fa92d76435930ca73b176ae900d6a0c706b2a571a2f79d8aa4bafc92f031d5250599823793364506c5518344076b618083c0ff82ccc00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000001e87f85809dc00001ca00f9b197d866428b19c7aa5dfd1d9e361b1d19742dd3f1b583ff6c451034334a06471f630fc4b521824b4f12bf1ca79e7fd9a826331b525d53454fc09678b179b");

var formattedOutput = formatOutputInArray(decodedArray);
var [nonce, gasPrice, gasLimit, to, value, data, v, r, s] = formattedOutput


// var rawTransaction = encode(formattedOutput);
// console.log(bytesToHex(rawTransaction))