# Multi-stage build for progress-api
FROM python:3.11-slim as base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5001

# Production stage
FROM base as production

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "--timeout", "120", "run:app"]

# Development stage
FROM base as development

# Install dev dependencies
RUN pip install --no-cache-dir pytest pytest-cov black isort mypy

# Run with Flask development server
CMD ["python", "run.py"]
