FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim
WORKDIR /app

# Enable bytecode compilation and suppress uv output
ENV UV_COMPILE_BYTECODE=1
ENV UV_SYSTEM_PYTHON=1
ENV PORT=8082

# Copy dependency files first for caching
COPY pyproject.toml .
# If uv.lock exists, copy it. Otherwise ignore.
COPY uv.lock* . 

# Install dependencies
RUN uv pip install -r pyproject.toml

# Copy application code
COPY . .

EXPOSE 8082
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8082"]

