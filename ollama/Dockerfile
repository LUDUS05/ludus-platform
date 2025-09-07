FROM ollama/ollama:latest

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*

# Expose port
EXPOSE 11434

# Copy Modelfile
COPY ollama/Modelfile /Modelfile

# Create startup script
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'ollama serve &' >> /start.sh && \
    echo 'sleep 10' >> /start.sh && \
    echo 'ollama pull llama3.2' >> /start.sh && \
    echo 'ollama create lds_crew/lds -f /Modelfile' >> /start.sh && \
    echo 'wait' >> /start.sh && \
    chmod +x /start.sh

# Use the startup script
CMD ["/start.sh"]
