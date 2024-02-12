import subprocess
import json
cli_name = 'bitcoin-cli'

def get_block_hash(block_number):
    command = f"./{cli_name} --data-dir=/root/.blocx-testnet getblockhash {block_number}"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.stdout.strip()

def is_chainlock_active(block_number):
    block_hash = get_block_hash(block_number)
    block_data = get_block_data(block_hash)
    
    return block_data.get("chainlock", False)

def get_block_data(block_hash):
    command = f"./{cli_name}  --data-dir=/root/.blocx-testnet getblock {block_hash} 1"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout)

def check_chainlock_status(start_block, end_block):
    print("\nBlock Range\tChainlock Status")
    for block_number in range(start_block, end_block + 1):
        chainlock_active = is_chainlock_active(block_number)
        print(f"{block_number}\t\t{'Active' if chainlock_active else 'Not Active'}")

if __name__ == "__main__":
    start_block = int(input("Enter start block: "))
    end_block = int(input("Enter end block: "))

    check_chainlock_status(start_block, end_block)