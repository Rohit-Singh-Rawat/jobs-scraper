# Job Board Scraper API

 API service that scrapes job listings from major tech companies (Microsoft, Google, and Amazon) and provides structured access to the data.

## Features

- Automated scraping from multiple job boards
- Configurable scraping intervals via cron jobs
- MongoDB integration for data persistence
- Structured logging system

## Tech Stack

- TypeScript
- Node.js
- MongoDB
- Winston (logging)
- Node-cron
- Mongoose

## Docker Installation

1. Install Docker on your system
   - [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - [Docker Engine for Linux](https://docs.docker.com/engine/install/)

2. Create a Docker network for container communication:
   ```bash
   docker network create jb_net
   ```
3. Start MongoDB database container:
   ```bash
   docker run --name mongo --network jb_net -d -p 27017:27017 mongo:latest
   ```

4. Build the application Docker image:
   ```bash
   docker build -t jb-scraper .
   ```

5. Run the application container:
   ```bash
   docker run --network jb_net -e MAX_PAGES=10 -e SCRAPE_INTERVAL="0 */2 * * *" -p 3000:3000 -d jb-scraper
   ```

Note: The `MAX_PAGES` environment variable controls how many pages to scrape from each job board. The `SCRAPE_INTERVAL` uses cron syntax to set how often scraping occurs (default: every 2 hours).
   ```
