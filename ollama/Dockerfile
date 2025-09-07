FROM ollama/ollama:latest

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*
ENV OLLAMA_KEEP_ALIVE=24h
ENV OLLAMA_NUM_PARALLEL=1
ENV OLLAMA_MAX_LOADED_MODELS=1

# Expose port
EXPOSE 11434

# Copy Modelfile and startup script
COPY ollama/Modelfile /Modelfile
COPY ollama/start.sh /start.sh

# Make startup script executable
RUN chmod +x /start.sh

# Create health check script
RUN echo '#!/bin/bash' > /healthcheck.sh && \
    echo 'curl -f http://localhost:11434/api/tags || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /healthcheck.sh

# Use the startup script as entrypoint
ENTRYPOINT ["/start.sh"]
