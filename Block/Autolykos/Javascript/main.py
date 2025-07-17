import hashlib
from typing import List, Tuple

# ── 1. constants ────────────────────────────────────────────────────────────
N_BASE                    = 1 << 26          #  2²⁶
INCREASE_START            = 600 * 1024
INCREASE_PERIOD_FOR_N     = 50  * 1024
N_INCREASEMENT_HEIGHT_MAX = 4_198_400

# 8 KiB constant M  (uint64 big-endian 0‥1023)
M = b"".join(i.to_bytes(8, "big") for i in range(1024))

# ── 2. helpers ──────────────────────────────────────────────────────────────
def N(height: int) -> int:
    """Exact replica of the JS `N` function (divide first, then multiply)."""
    height = min(N_INCREASEMENT_HEIGHT_MAX, height)
    if height < INCREASE_START:
        return N_BASE
    if height >= N_INCREASEMENT_HEIGHT_MAX:
        return 2_147_387_550
    res = N_BASE
    iters = ((height - INCREASE_START) // INCREASE_PERIOD_FOR_N) + 1
    for _ in range(iters):
        res = (res // 100) * 105          # ← key detail
    return res

def blake2b(data: bytes, outlen: int = 32) -> bytes:
    return hashlib.blake2b(data, digest_size=outlen).digest()

def gen_indexes(seed: bytes, height: int) -> List[int]:
    h   = blake2b(seed)
    ext = h + h                            # 64 B
    mod = N(height)
    return [int.from_bytes(ext[i:i+4], "big") % mod for i in range(32)]

# ── 3. main routine ─────────────────────────────────────────────────────────
def autolykos2_hashes(coinbase: bytes, height: int) -> Tuple[bytes, bytes]:
    h = height.to_bytes(4, "big")

    pre_i  = int.from_bytes(blake2b(coinbase)[24:32], "big")
    i_int  = pre_i % N(height)
    i      = i_int.to_bytes(4, "big")

    print("i:", i.hex())                  # matches Node output

    e = blake2b(i + h + M)[1:32]

    f = 0
    for idx in gen_indexes(e + coinbase, height):
        piece = blake2b(idx.to_bytes(4, "big") + h + M)[1:32]
        f    += int.from_bytes(piece, "big")

    f  &= (1 << 256) - 1                  # keep low 256 bits
    H  = f.to_bytes(32, "big")            # primary hash

    return H, blake2b(H)

# ── 4. quick check against the JS sample ───────────────────────────────────
if __name__ == "__main__":
    input_hex = ("1d83eff4921be239c252bdddb62ded364403808857c138f0a323e0dbc568c857639e221bfcee7c37")
    height    = 614_400

    h1, h2 = autolykos2_hashes(bytes.fromhex(input_hex), height)

    print("primary : ", h1.hex())
    print("secondary:", h2.hex())
