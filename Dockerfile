FROM python:3.9-slim

# Install system dependencies for PyEZ/JSNAPy
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libxml2-dev libxslt-dev libffi-dev libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Create the internal mount points
RUN mkdir -p /app/config /app/snapshots /app/testfiles

# Set the working directory to the app root
WORKDIR /app

# Default to running uvicorn (can be overridden for jsnapy commands)
CMD ["python3", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
