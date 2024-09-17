FROM python:3.12-slim-bullseye
LABEL org.opencontainers.image.source=https://github.com/sabbyx/aspint

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install --with-deps

COPY . .

CMD ["fastapi", "dev", "src/main.py", "--host", "0.0.0.0", "--port", "8000"]
