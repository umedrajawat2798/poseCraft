FROM node:20-bookworm-slim
COPY . /app
RUN apt-get update && \
    apt-get install -y build-essential \
    wget \
    python3 \
    make \
    gcc \
    libc6-dev
WORKDIR /app
RUN npm install
CMD ["node", "worker.js"]
