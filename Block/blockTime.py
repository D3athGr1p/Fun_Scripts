import subprocess
import json
from datetime import datetime

cli_name = 'bitcoin-cli'

def get_block_hash(block_number):
    command = f"./{cli_name} getblockhash {block_number}"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.stdout.strip()

def get_block_data(block_hash):
    command = f"./{cli_name} getblock {block_hash} 1"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout)

def get_block_time_difference(start_block, end_block):
    block_number = start_block
    block_hash = get_block_hash(block_number)
    block_data = get_block_data(block_hash)
    block_time = block_data["time"]

    block_times = [(block_number, block_hash, block_time)]
    for block_number in range(start_block + 1, end_block + 1):
        next_block_hash = get_block_hash(block_number)
        next_block_data = get_block_data(next_block_hash)
        next_block_time = next_block_data["time"]
        time_difference = next_block_time - block_time

        block_times.append((block_number, next_block_hash, time_difference))

        # Update for the next iteration
        block_hash = next_block_hash
        block_time = next_block_time

    return block_times

if __name__ == "__main__":
    start_block = int(input("Enter start block: "))
    end_block = int(input("Enter end block: "))

    block_times = get_block_time_difference(start_block, end_block)

    print("\nBlock Number\tBlock Hash\t\tTime Difference (seconds)")
    for block_number, block_hash, time_difference in block_times:
        print(f"{block_number}\t\t{block_hash}\t{time_difference}")