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

# Upgrade pip to the latest 2026 version to avoid solver issues
RUN pip install --no-cache-dir --upgrade pip==26.0.1 setuptools wheel

# Install dependencies using exact pins from requirements_api.txt
COPY requirements_api.txt .
RUN pip install --no-cache-dir -r requirements_api.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start command
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "api_server:app"]
