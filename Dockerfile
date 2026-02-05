```dockerfile
# Use Python 3.11 for maximum ML compatibility
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
# libgomp1 is required for faiss-cpu on Linux
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    default-libmysqlclient-dev \
    pkg-config \
# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Layer 1: Install Torch CPU first (Crucial for Render/Linux)
# This avoids pulling the massive GPU versions
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Layer 2: Install remaining dependencies from minimal list
# Pip will solve the compatible graph based on the installed torch/numpy
COPY requirements_api.txt .
RUN pip install --no-cache-dir -r requirements_api.txt

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 8000

# Start command
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "api_server:app"]
