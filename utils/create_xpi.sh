#!/bin/bash

scriptDir="$(dirname "$0")"
python3 "$scriptDir/build_xpi.py"
read -p "Press [Enter] to continue..."