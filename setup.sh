#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Run the setup script
echo "🔧 Setting up environment files..."
node setup-env.js

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo "✅ Setup completed successfully!"
else
    echo "❌ Setup failed!"
fi 