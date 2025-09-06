#!/bin/bash

# Start Ollama server in background
ollama serve &

# Wait for server to start
sleep 10

# Pull the base model
echo "Pulling llama3.2..."
ollama pull llama3.2

# Create custom LUDUS model
echo "Creating custom LUDUS model..."
ollama create lds_crew/lds -f /Modelfile

# Keep the container running
wait
