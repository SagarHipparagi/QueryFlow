# Use an official Python runtime as a parent image
# Using 3.12 to match the user's local working environment (2026 standard)
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (needed for compiling some python packages like numpy/pandas extensions)
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy the specific requirements file first to leverage Docker cache
COPY requirements_api.txt .

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Layer 1: Install Numpy (Critical Constraint)
# prevents numpy 2.0 conflicts
RUN pip install --no-cache-dir "numpy<2.0.0"

# Layer 2: Install Heavy ML Dependencies (Torch, Faiss, Transformers)
# Installing these first ensures they get their preferred core libs
RUN pip install --no-cache-dir \
    sentence-transformers \
    faiss-cpu

# Layer 3: Install LangChain (AI Orchestration)
RUN pip install --no-cache-dir \
    langchain-community \
    langchain-openai

# Layer 4: Install Web Framework & Utilities (Flask, etc)
RUN pip install --no-cache-dir -r requirements_api.txt

# Copy the rest of the backend application code
COPY . .

# Expose the port (Render will override this, but good for documentation)
EXPOSE 8000

# Run the application with Gunicorn
# Bind to 0.0.0.0 because it's running inside a container
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "api_server:app"]
