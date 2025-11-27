#!/usr/bin/env bash
set -e

# Change to script directory
cd "$(dirname "$0")"

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Installing CmdStan for Prophet..."
python -c "import cmdstanpy; cmdstanpy.install_cmdstan()"

echo "Build complete!"