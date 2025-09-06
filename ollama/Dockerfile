FROM ollama/ollama:latest

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*

# Expose port
EXPOSE 11434

# Create a startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Use the startup script
CMD ["/start.sh"]
