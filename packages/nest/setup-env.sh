#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "No .env.local file found."
    
    # Check if .env.example exists
    if [ -f .env.example ]; then
        echo "Copying .env.example to .env..."
        cp .env.example .env.local
        echo "✅ Created .env file from .env.example"
    else
        echo "❌ Error: No .env.example file found."
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi