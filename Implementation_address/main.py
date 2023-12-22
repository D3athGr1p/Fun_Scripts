from web3 import Web3
contract_address = "0x....." 

def main():
    web3 = Web3(Web3.HTTPProvider("https://bsc-dataseed2.defibit.io/"))
    impl_contract = Web3.to_hex(
        web3.eth.get_storage_at(
            contract_address,
            "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
        )
    )
    print(impl_contract)


main()
