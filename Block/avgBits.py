import subprocess
import json

cli_name = 'bitcoin-cli'

def get_block_hash(block_number):
    command = f"./{cli_name} getblockhash {block_number}"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.stdout.strip()

def get_block_data(block_hash):
    command = f"./{cli_name} getblock {block_hash} 1"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout)

def get_average_bits(start_block, end_block):
    block_number = start_block
    block_hash = get_block_hash(block_number)
    block_data = get_block_data(block_hash)
    bits = int(block_data["bits"], 16)

    total_bits = bits
    total_blocks = 1

    for block_number in range(start_block + 1, end_block + 1):
        next_block_hash = get_block_hash(block_number)
        next_block_data = get_block_data(next_block_hash)
        bits = int(next_block_data["bits"], 16)

        total_bits += bits
        total_blocks += 1

        # Update for the next iteration
        block_hash = next_block_hash

    average_bits = total_bits / total_blocks
    return average_bits

def calculate_average_bits(start_range, end_range, divider):
    print("\nBlock Range\tAverage Bits")
    for i in range(start_range, end_range, divider):
        sub_range_start = i
        sub_range_end = min(i + divider - 1, end_range)
        average_bits = get_average_bits(sub_range_start, sub_range_end)
        print(f"{sub_range_start} to {sub_range_end}\t\t{average_bits}")

if __name__ == "__main__":
    start_range = int(input("Enter start range: "))
    end_range = int(input("Enter end range: "))
    divider = int(input("Enter divider: "))

    calculate_average_bits(start_range, end_range, divider)