FROM python:3.13-slim

WORKDIR /app

RUN apt update && \
    apt install -y etherwake && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

CMD ["python3", "app.py"]
