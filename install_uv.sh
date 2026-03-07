#!/bin/bash
echo "Installing Python dependencies locally for Vercel serverless deployment..."
cd server
python3 -m pip install -r requirements.txt -t python_modules
cd ..
echo "Setup complete."
