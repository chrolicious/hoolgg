#!/bin/bash
python -c '
import os

filepath = "services/progress-api/app/routes/gear.py"
with open(filepath, "r") as f:
    content = f.read()

# Very crude but effective way to strip everything from sync_gear onwards
if "def sync_gear(" in content:
    idx = content.find("@bp.route(\"/characters/<int:cid>/gear/sync\", methods=[\"POST\"])")
    if idx != -1:
        new_content = content[:idx]
        with open(filepath, "w") as f:
            f.write(new_content)
'
