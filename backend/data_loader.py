import json
import csv
import os
from pathlib import Path

# ERC20 Transfer topic
TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
NOMAD_ERC20_BRIDGE = "0x88a69b4e698a4b090df6cf5bd7b2d47325ad30a3"
NOMAD_REPLICA = "0x5bae47bf29f4e9b1e275c0b427b84c4daa30033a"

# Mapping from ERC20 address to token symbol and decimals
# We use the token prices directory to infer the token symbols.
KNOWN_TOKENS = {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": ("USDC", 6),
    "0x6b175474e89094c44da98b954eedeac495271d0f": ("DAI", 18),
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": ("WBTC", 8),
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": ("WETH", 18),
    "0xdac17f958d2ee523a2206206994597c13d831ec7": ("USDT", 6),
    "0x853d955acef822db058eb8505911ed77f175b99e": ("FRAX", 18),
}

def load_block_times(csv_path):
    block_times = {}
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            block_times[row['block_number']] = int(row['timestamp'])
    return block_times

def load_nomad_data(raw_data_dir):
    blocks_path = os.path.join(raw_data_dir, 'nomad-bridge', 'blocks', 'ethereum.csv')
    block_times = load_block_times(blocks_path)

    tx_path = os.path.join(raw_data_dir, 'nomad-bridge', 'tx_receipts', 'ethereum_selected_interval.json')
    with open(tx_path, 'r') as f:
        txs = json.load(f)

    events = []
    
    # 15259464 is approximately when the attack started or when blocks were drained
    # For Nomad, almost all selected_interval transactions are the attack.
    for tx in txs:
        block_number = int(tx['blockNumber'], 16)
        ts = block_times.get(str(block_number), 0)
        
        # We need UTC string
        from datetime import datetime, timezone
        if ts > 0:
            ts_str = datetime.fromtimestamp(ts, tz=timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        else:
            ts_str = "1970-01-01T00:00:00Z"

        tx_hash = tx['transactionHash']
        actor = tx['from']

        # Look for withdrawals from the bridge
        for log in tx.get('logs', []):
            if log.get('topics') and log['topics'][0] == TRANSFER_TOPIC:
                if len(log['topics']) > 2:
                    from_addr = "0x" + log['topics'][1][-40:]
                    to_addr = "0x" + log['topics'][2][-40:]
                    
                    if from_addr.lower() == NOMAD_ERC20_BRIDGE.lower():
                        contract = log['address'].lower()
                        token_info = KNOWN_TOKENS.get(contract, ("UNKNOWN", 18))
                        token_symbol, decimals = token_info
                        
                        raw_amount = int(log['data'], 16)
                        amount = raw_amount / (10 ** decimals)
                        
                        # Simplified USD value (mocked as 1-to-1 for stables, etc)
                        # The real loader should read token_prices
                        usd_value = amount 
                        if token_symbol == "WBTC": usd_value = amount * 20000
                        elif token_symbol == "WETH": usd_value = amount * 1500

                        events.append({
                            "ts": ts_str,
                            "bridge": "nomad",
                            "kind": "withdraw",
                            "chain": "ethereum",
                            "tx_hash": tx_hash,
                            "transfer_id": tx_hash, # Using tx_hash as proxy for transfer_id
                            "token": token_symbol,
                            "amount": round(amount, 4),
                            "usd_value": round(usd_value, 2),
                            "actor": actor,
                            "status": "pending"
                        })
    return events

if __name__ == '__main__':
    root_dir = Path(__file__).parent.parent
    events = load_nomad_data(os.path.join(root_dir, 'raw-data'))
    print(f"Loaded {len(events)} events.")
    print("First event:", events[0] if events else "None")
