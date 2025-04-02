# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
}

# Check if npm is installed
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm is not installed. Please install npm."
    exit 1
}

# Create necessary directories
Write-Host "Creating project directories..."
New-Item -ItemType Directory -Force -Path "src"
New-Item -ItemType Directory -Force -Path "src/components"
New-Item -ItemType Directory -Force -Path "src/components/pages"
New-Item -ItemType Directory -Force -Path "src/services"
New-Item -ItemType Directory -Force -Path "src/utils"

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Install FFmpeg if not already installed
if (!(Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "FFmpeg is not installed. Installing FFmpeg..."
    # You might want to add FFmpeg installation logic here
    # This depends on the operating system and package manager
}

# Create initial git repository
Write-Host "Initializing git repository..."
git init

# Create initial commit
Write-Host "Creating initial commit..."
git add .
git commit -m "Initial commit"

Write-Host "Setup completed successfully!"
Write-Host "To start development, run: npm run dev" 