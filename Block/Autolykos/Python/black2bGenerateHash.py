import struct

from typing import Tuple, List
import pyblake2
from binascii import hexlify

N_BASE = 2 ** 26
INCREASE_START = 600 * 1024
INCREASE_PERIOD_FOR_N = 50 * 1024
N_INCREASEMENT_HEIGHT_MAX = 4198400
M = b''.join(struct.pack('>Q', i) for i in range(1024))

def generate_message(header_hex):
    '''Generic message generator.'''
    if isinstance(header_hex, str):
        input_bytes = header_hex.encode('utf-8')
    else:
        input_bytes = header_hex
    hash_object = pyblake2.blake2b(digest_size=32)
    hash_object.update(input_bytes)

    return hexlify(hash_object.digest()).decode('utf-8')


def N(height: int) -> int:
    height = min(N_INCREASEMENT_HEIGHT_MAX, height)
    if height < INCREASE_START:
        return N_BASE
    elif height >= N_INCREASEMENT_HEIGHT_MAX:
        return 2147387550
    else:
        res = N_BASE
        iterations_number = ((height - INCREASE_START) // INCREASE_PERIOD_FOR_N) + 1
        for _ in range(iterations_number):
            res = res * 105 // 100
        return res

def blake2b(seed: bytes) -> bytes:
    return pyblake2.blake2b(seed, digest_size=32).digest()

def gen_indexes(seed: bytes, height: int) -> List[int]:
    hash_value = blake2b(seed)
    extended_hash = hash_value + hash_value
    return [int.from_bytes(extended_hash[i:i+4], 'big') % N(height) for i in range(32)]

def autolykos2_hashes(serialized_header: bytes, height: int) -> Tuple[bytes, bytes]:
    h = height.to_bytes(4, 'big')
    i = (int.from_bytes(blake2b(serialized_header)[24:32], 'big') % N(height)).to_bytes(4, 'big')
    e = blake2b(i + h + M)[1:32]
    J = [item.to_bytes(4, 'big') for item in gen_indexes(e + serialized_header, height)]
    f = sum(int.from_bytes(blake2b(item + h + M)[1:32], 'big') for item in J)
    hash_value = f.to_bytes(32, 'big')

    return hash_value, blake2b(hash_value)

def get_without_nonce(msg):
    version = msg[0:8]
    previous = msg[8:72]
    merkle = msg[72:136]
    nbits = msg[136:144]
    timestamp = msg[144:152]
    nonce = msg[152:160]
    nNewNonce = msg[160:176]
    aHeight = msg[176:184]
    without_extra_data = version + previous + merkle + nbits + timestamp + aHeight

    nNewNonce_bytes = [nNewNonce[i:i+2] for i in range(0, len(nNewNonce), 2)]
    nNewNonce_b = ''.join(nNewNonce_bytes[::-1])
    

    aHeight_bytes = [aHeight[i:i+2] for i in range(0, len(aHeight), 2)]
    reversed_aHeight = ''.join(aHeight_bytes[::-1])
    reversed_aHeight_int = int(reversed_aHeight, 16)


    return [without_extra_data, nNewNonce_b, reversed_aHeight_int]

header = "050000005e19edaad6b404136c632248d74966208bfd820437a669cdb3e24a000000000092987d09de131195805d47b969acb17069a744e956ef82cc7b75834bb59b6f2d3685146835da001c00000000377ceefc1b229e6300600900"
if (header[:8] == "05000000"):
    [header_without_nonce, nNewNonce, height] = get_without_nonce(header)
    msg = generate_message(header_without_nonce)
    buf = bytes.fromhex(msg + nNewNonce)
    header_hash = autolykos2_hashes(buf, height)[1]
    print(header_hash.hex())