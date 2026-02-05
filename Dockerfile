```dockerfile
# Use Python 3.12 to match building locally in 2026
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
# libgomp1 is required for faiss-cpu on Linux
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    default-libmysqlclient-dev \
    pkg-config \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install uv for robust resolution
RUN pip install --no-cache-dir --upgrade pip uv

# Install dependencies using uv (much better solver for frozen lists)
# We use --system to install into the container's python environment
COPY requirements_api.txt .
RUN uv pip install --no-cache-dir --system -r requirements_api.txt

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 8000

# Start command
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "api_server:app"]
