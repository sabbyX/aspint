FROM python:3.12-slim-bullseye

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["fastapi", "run", "src/main.py", "--port", "8000"]
