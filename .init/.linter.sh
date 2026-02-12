#!/bin/bash
cd /home/kavia/workspace/code-generation/energy-monitoring-dashboard-218670-218685/energy_monitor_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

