#!/bin/bash

# Define the list of IPs and ports
ips=(
"1.2.3.4 12972"
)

timeout_duration=10

# Initialize counters
success_count=0
failure_count=0

# Iterate through each IP and port combination
for ip_port in "${ips[@]}"; do
    ip=$(echo $ip_port | awk '{print $1}')
    port=$(echo $ip_port | awk '{print $2}')

    # Use nc command to check the port
    timeout $timeout_duration nc -vz $ip $port &>/dev/null

    # Check the exit status of the nc command
    if [ $? -eq 0 ]; then
        echo "$ip $port port [tcp/*] succeeded"
        success_count=$((success_count+1))
        echo "$ip $port port [tcp/*] succeeded" >> ip.log
    else
        echo "$ip $port port FAILED"
        failure_count=$((failure_count+1))
        echo "$ip $port port FAILED" >> ip.log
    fi
done

# Display the final counts
echo "Total succeeded: $success_count"
echo "Total failed: $failure_count"