FROM python:3.12-slim-bullseye

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && \
    apt-get upgrade --assume-yes && \
    # cURL is necessary to invoke the "healthcheck" function using Docker
    apt-get install curl --assume-yes && \
    rm --recursive --force /var/lib/apt/lists/*

COPY . .

CMD ["fastapi", "dev", "src/main.py", "--host", "0.0.0.0", "--port", "8000"]
