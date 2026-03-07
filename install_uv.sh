#!/bin/bash
echo "Installing Python dependencies globally for Vercel serverless deployment..."
cd server
pip3 install -r requirements.txt
cd ..
echo "Setup complete."
