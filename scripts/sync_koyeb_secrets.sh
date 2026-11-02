#!/usr/bin/env bash
set -eo pipefail

ENV_FILE="${1:-backend/services/auth/.env}"

# 1. Check if Koyeb CLI is installed
if ! command -v koyeb &> /dev/null; then
    echo -e "\033[0;31m[ERROR] Koyeb CLI ('koyeb') is not installed or not found in PATH.\033[0m"
    echo -e "\033[1;33mPlease install it from https://www.koyeb.com/docs/build-and-deploy/cli/installation before running this script.\033[0m"
    exit 1
fi

# 2. Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "\033[0;31m[ERROR] Specified .env file not found at: $ENV_FILE\033[0m"
    exit 1
fi

echo -e "\033[0;36m==========================================================\033[0m"
echo -e "\033[0;36m Synchronizing Secrets to Koyeb Vault from: $ENV_FILE\033[0m"
echo -e "\033[0;36m==========================================================\033[0m"

while IFS= read -r line || [ -n "$line" ]; do
    # Trim leading/trailing whitespace
    trimmed="$(echo -e "${line}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

    # Skip empty lines and comment lines
    if [ -z "$trimmed" ] || [[ "$trimmed" =~ ^# ]]; then
        continue
    fi

    # Check if line contains '='
    if [[ "$trimmed" =~ "=" ]]; then
        key="${trimmed%%=*}"
        value="${trimmed#*=}"

        # Trim spaces around key and value
        key="$(echo -e "${key}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
        value="$(echo -e "${value}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

        # Strip surrounding double or single quotes
        if [[ "$value" =~ ^\".*\"$ ]] || [[ "$value" =~ ^\'.*\'$ ]]; then
            value="${value:1:-1}"
        fi

        echo -n "Processing secret: $key ... "

        # Attempt to create secret; if failed, attempt to update
        if koyeb secret create "$key" --value "$value" > /dev/null 2>&1; then
            echo -e "\033[0;32m[CREATED]\033[0m"
        elif koyeb secret update "$key" --value "$value" > /dev/null 2>&1; then
            echo -e "\033[0;33m[UPDATED]\033[0m"
        else
            echo -e "\033[0;31m[FAILED]\033[0m"
        fi
    fi
done < "$ENV_FILE"

echo -e "\n\033[0;36mSecret synchronization process complete.\033[0m"

