# 🍽️ FoodConnect - Deployment Guide

FoodConnect is a modern food social network platform built with NestJS, React, and real-time notifications. This guide covers deployment using Docker and Docker Compose.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/jeremiasmarinho/foodconnect.git
cd foodconnect
```

### 2. Environment Configuration

Copy and configure environment variables:

```bash
cp .env.production .env
```

Edit `.env` with your production values:

```env
# Database Configuration
POSTGRES_DB=foodconnect
POSTGRES_USER=foodconnect
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://foodconnect:your_secure_password_here@postgres:5432/foodconnect

# Redis Configuration
REDIS_PASSWORD=your_redis_password_here
REDIS_URL=redis://:your_redis_password_here@redis:6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_256_bits_minimum

# VAPID Keys (will be generated automatically if not set)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=admin@yourdomain.com
```

### 3. Deploy with Docker

#### Option A: Using Deploy Script (Recommended)

**Linux/macOS:**

```bash
chmod +x deploy.sh
./deploy.sh production
```

**Windows PowerShell:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy.ps1 -Environment production
```

#### Option B: Manual Docker Compose

```bash
# Build and start services
docker-compose --env-file .env up -d --build

# Run database migrations
docker-compose exec backend npx prisma migrate deploy
```

### 4. Verify Deployment

The application will be available at:

- **Frontend:** http://localhost
- **Backend API:** http://localhost/api
- **API Documentation:** http://localhost/api/docs

Check health status:

```bash
curl http://localhost/health
curl http://localhost/api/health
```

## 🛠️ Services Architecture

### Docker Services

| Service      | Port    | Description                     |
| ------------ | ------- | ------------------------------- |
| **nginx**    | 80, 443 | Reverse proxy and load balancer |
| **frontend** | 3000    | React/Next.js application       |
| **backend**  | 3001    | NestJS API server               |
| **postgres** | 5432    | PostgreSQL database             |
| **redis**    | 6379    | Cache and session store         |

### Service Dependencies

```
nginx → frontend → backend → postgres
                        ↓
                      redis
```

## 🔧 Configuration

### Environment Variables

#### Database

- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `DATABASE_URL`: Full PostgreSQL connection string

#### Cache

- `REDIS_PASSWORD`: Redis password
- `REDIS_URL`: Redis connection string

#### Security

- `JWT_SECRET`: JWT signing secret (minimum 256 bits)
- `VAPID_PUBLIC_KEY`: VAPID public key for push notifications
- `VAPID_PRIVATE_KEY`: VAPID private key for push notifications

#### Application

- `NODE_ENV`: Environment (production/development)
- `FRONTEND_URL`: Frontend URL for CORS
- `BACKEND_URL`: Backend URL for API calls

### SSL/HTTPS Configuration

For production with SSL certificates:

1. Place certificates in `nginx/ssl/`:

   - `certificate.crt`
   - `private.key`

2. Update `nginx/nginx.conf` to enable HTTPS server block

3. Redirect HTTP to HTTPS in the configuration

## 📊 Database Management

### Migrations

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Reset database (development only)
docker-compose exec backend npx prisma migrate reset --force
```

### Backup and Restore

#### Create Backup

```bash
# Manual backup
docker-compose exec postgres pg_dump -U foodconnect foodconnect > backup.sql

# Using backup script
chmod +x scripts/backup.sh
./scripts/backup.sh
```

#### Restore Backup

```bash
# Using restore script
chmod +x scripts/restore.sh
./scripts/restore.sh /path/to/backup.sql.gz
```

#### Automated Backups

Add to crontab for automated daily backups:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/foodconnect/scripts/backup.sh
```

## 🔍 Monitoring and Logs

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f nginx
```

### Health Checks

All services have health checks configured:

```bash
# Check all service status
docker-compose ps

# Manual health checks
curl http://localhost/health        # Nginx
curl http://localhost/api/health    # Backend
curl http://localhost:3000         # Frontend
```

### Performance Monitoring

The application includes built-in performance monitoring:

- **Backend Health Endpoint**: `/api/health`

  - Database connectivity
  - Cache connectivity
  - Memory usage
  - Response times

- **Frontend Performance**: Built-in React performance tracking
- **Database Monitoring**: PostgreSQL performance insights

## 🚦 Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U foodconnect

# Reset database
docker-compose down -v
docker-compose up -d postgres
# Wait for database to be ready, then run migrations
```

#### Permission Issues

```bash
# Fix file permissions
sudo chown -R $(whoami):$(whoami) .
chmod +x deploy.sh scripts/*.sh
```

### Debug Mode

For debugging, run services individually:

```bash
# Start dependencies only
docker-compose up -d postgres redis

# Run backend in development mode
cd backend
npm install
npm run start:dev

# Run frontend in development mode
cd frontend
npm install
npm run dev
```

## 🔐 Security

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (256+ bits)
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set secure environment variables
- [ ] Enable database SSL
- [ ] Configure backup encryption

### Security Headers

The Nginx configuration includes security headers:

- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy
- Referrer-Policy

### Rate Limiting

Built-in rate limiting for:

- API endpoints: 100 requests/15 minutes
- Authentication: 5 requests/15 minutes

## 📈 Scaling

### Horizontal Scaling

To scale the application:

1. **Load Balancer**: Use multiple Nginx instances
2. **Application Servers**: Scale backend and frontend services
3. **Database**: Configure PostgreSQL cluster or read replicas
4. **Cache**: Use Redis Cluster for high availability

```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Scale frontend instances
docker-compose up -d --scale frontend=2
```

### Performance Optimization

- **Database**: Proper indexing and query optimization
- **Cache**: Redis for session storage and API caching
- **CDN**: Serve static assets from CDN
- **Compression**: Gzip enabled in Nginx
- **Image Optimization**: WebP format support

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run any new migrations
docker-compose exec backend npx prisma migrate deploy
```

### Maintenance Mode

To enable maintenance mode, update Nginx configuration:

```nginx
return 503;
error_page 503 @maintenance;
location @maintenance {
    return 503 "Application is under maintenance";
}
```

## 📞 Support

For issues and support:

- Check the [troubleshooting section](#-troubleshooting)
- Review application logs
- Check GitHub Issues
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**FoodConnect** - Connecting food lovers, one meal at a time! 🍽️✨
