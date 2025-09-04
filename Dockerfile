FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create python symlink
RUN ln -sf /usr/local/bin/python3 /usr/local/bin/python
RUN ln -sf /usr/local/bin/pip3 /usr/local/bin/pip

# Set environment
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Collect static files
RUN python3 manage.py collectstatic --noinput --clear

EXPOSE 8000

CMD ["sh", "-c", "python3 manage.py migrate --noinput && python3 manage.py create_admin && gunicorn sapere.wsgi:application --bind 0.0.0.0:$PORT"]