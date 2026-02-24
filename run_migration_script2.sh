#!/bin/bash

# Remove permission checks from personal roster routes
for file in services/progress-api/app/routes/*.py; do
    if [[ "$file" == *"personal_roster.py"* ]] || [[ "$file" == *"__init__.py"* ]] || [[ "$file" == *"health.py"* ]] || [[ "$file" == *"reference.py"* ]]; then
        continue
    fi
    echo "Processing $file..."
    
    # Remove lines containing perm_check
    sed -i '' '/perm_check = check_permission(bnet_id, gid)/,+2d' "$file"
    sed -i '' '/perm_check = check_permission(bnet_id, guild_id)/,+2d' "$file"
    
    # Optional: We also need to remove the check_permission function definition entirely if it exists.
    # But it's safer to just remove the usages first.
done
