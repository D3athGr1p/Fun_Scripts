#!/bin/bash

ip_ports=(
"1.2.3.4:1234"
"5.6.7.8:1234"
)

username="username"
userpassword="password"

# Function to query and process the response
query_ip_port() {
  local ip_port="$1"

  # Perform the curl query and capture the response
  response=$(curl --max-time 10 --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "masternode", "params": ["status"] }' -H 'content-type: text/plain;' "http://$username:$userpassword@$ip_port/" 2>/dev/null)
  
  # Extract the status from the response using jq
  status=$(echo "$response" | jq -r '.result.status')

  # Print the IP:Port and its status
  echo "$ip_port = $status"
}

# Iterate through the list of IP:PORT combinations
for ip_port in "${ip_ports[@]}"; do
  query_ip_port "$ip_port"
done