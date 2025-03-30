# MagnetCube Web Game

A 3D web-based implementation of the MagnetCube board game, built with React, Three.js, and modern web technologies.

## Prerequisites

Before you begin, ensure you have the following installed:
- Docker (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)
- Git

## Project Structure

```
magnet-cube-web/
├── src/
│   ├── components/
│   │   ├── game/      # Game-specific components
│   │   ├── ui/        # UI components
│   │   └── three/     # Three.js components
│   ├── store/         # Redux store configuration
│   └── main.jsx       # Application entry point
├── public/            # Static assets
├── Dockerfile         # Docker build configuration
├── docker-compose.yml # Docker services configuration
└── nginx.conf         # Nginx server configuration
```

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd magnet-cube-web
```

2. Start the development server:
```bash
docker-compose up dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Available Docker Commands

### Development Mode
```bash
# Start the development server
docker-compose up dev

# Start in detached mode
docker-compose up -d dev

# View logs
docker-compose logs -f dev

# Stop the development server
docker-compose down dev
```

### Production Mode
```bash
# Build and start the production server
docker-compose up prod

# Start in detached mode
docker-compose up -d prod

# View logs
docker-compose logs -f prod

# Stop the production server
docker-compose down prod
```

### General Commands
```bash
# Rebuild containers
docker-compose up --build

# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# View container status
docker-compose ps
```

## Development Workflow

1. The development server runs on port 3000 with hot-reloading enabled
2. Any changes to the source code will automatically trigger a rebuild
3. The development environment includes:
   - Hot module replacement (HMR)
   - Source maps for debugging
   - Development-specific optimizations

## Production Deployment

1. Build and start the production server:
```bash
docker-compose up prod
```

2. The production server will be available at:
```
http://localhost:80
```

3. Production features include:
   - Optimized build
   - Nginx server with gzip compression
   - Static asset caching
   - Client-side routing support

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - If port 3000 or 80 is already in use, modify the ports in docker-compose.yml

2. **Container won't start**
   - Check logs: `docker-compose logs`
   - Ensure all required ports are available
   - Verify Docker daemon is running

3. **Build failures**
   - Clear Docker cache: `docker-compose build --no-cache`
   - Check for syntax errors in source code
   - Verify all dependencies are correctly listed in package.json

### Debugging

1. **View container logs**
```bash
docker-compose logs -f [service-name]
```

2. **Access container shell**
```bash
docker-compose exec [service-name] sh
```

3. **Check container status**
```bash
docker-compose ps
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the maintainers. 