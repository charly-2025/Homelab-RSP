FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc python3-dev swig build-essential wget unzip && \
    wget -q http://abyz.me.uk/lg/lg.zip && \
    unzip lg.zip && \
    cd lg && \
    make && \
    make install && \
    ldconfig && \
    cd .. && rm -rf lg lg.zip && \
    apt-get purge -y wget unzip && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3000

CMD ["python3", "app.py"]
