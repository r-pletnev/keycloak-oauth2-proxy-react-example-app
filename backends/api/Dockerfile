FROM python:3.12-slim-bookworm
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
EXPOSE 80
CMD ["litestar", "run", "--host", "0.0.0.0", "--port", "80"]
