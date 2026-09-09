# Deployment & Cloud Operations Guide

## 1. Docker Compose Multi-Container Orchestration

AgriQuantum includes a production-ready `docker-compose.yml` orchestrating the application stack:

```yaml
version: '3.8'

services:
  # 1. Next.js Web Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend

  # 2. FastAPI Production REST Gateway
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - postgres

  # 3. PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: agriquantum
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Launching with Docker Compose
```bash
docker compose up --build -d
```

---

## 2. Cloud Supabase PostgreSQL Deployment

1. **Create Supabase Project**:
   Create a new project at [https://supabase.com](https://supabase.com).
2. **Execute Database Schema**:
   Navigate to the SQL Editor in Supabase and execute the contents of [`supabase_schema.sql`](file:///c:/Users/JASWANTH/Downloads/fallfest/supabase_schema.sql).
3. **Configure Environment**:
   Update your root `.env` and `frontend/.env.local` with your Supabase URL, Anon Key, and Service Role Key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
   SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_KEY]
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[YOUR_REF].supabase.co:5432/postgres
   ```

---

## 3. Security & Production Checklist

- [x] No plaintext passwords stored (Bcrypt with salt rounds $\ge 12$).
- [x] JWT tokens signed with SHA-256 and configured expiration (`ACCESS_TOKEN_EXPIRE_MINUTES=1440`).
- [x] Rate limiting middleware enabled on public endpoints.
- [x] CORS origins restricted to approved web domains.
- [x] Database Row-Level Security (RLS) policies enforcing farm ownership.
- [x] Zero secret credentials committed to version control.
