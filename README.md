# Neo Hours

## Setup 🔧
This section outlines the initial configuration needed to get the project running.

### Commands to run 
- DB dev setup 
```bash
-- Creates the sqlite file and starts up the client
cd apps/client
pnpm dev

-- Setups the development database
cd ../../packages/db
pnpm run db:dev:setup
```


### Brevo Setup

- Brevo is an email marketing and transactional email service.
- You need to obtain an SMTP API key from Brevo (https://brevo.com).
- This key is likely used for sending automated emails from the application.


## Cloudflare Setup

- Cloudflare is a web infrastructure and security company.
- You need to create a new Cloudflare account if you don't have one.
Three pieces of information are required:

    1. Account ID: Unique identifier for your Cloudflare account

    2. D1 database ID: Identifier for your specific D1 database instance

    3. D1 access token: Authentication token to interact with the D1 database


- D1 is Cloudflare's SQL database, suggesting this project uses Cloudflare for database hosting because it is free and relatively easy to use.



# Project Structure
This section breaks down the main components of the project.

## Frontend/Backend (located in apps/client)

- This folder contains both the user interface and server-side logic.
- It handles:

    - Database interactions
    - User authentication
    - Rate limiting (to prevent abuse of the system)
    - Authorization middleware (controlling access to different parts of the application)




## Cron Job

- A cron job is a scheduled task that runs automatically at defined intervals.
- In this project, it's used to update different organization types periodically.
- This suggests the system deals with various organization structures that may change over time.


## Database Management (located in packages/db)

Contains scripts for managing the database in different environments (staging and production).
Provides commands for:

- Seeding: Populating the database with initial or test data
- Migration: Updating the database schema as the application evolves
- Full-text search support: Enabling efficient searching of text fields in the database




## Custom Email Templates (located in apps/email) [Work In Progress]

This section is for creating custom email templates.
It's intended for:

- Reminder emails: Likely for notifying users about tasks, hours logged, or other time-sensitive information
- Authentication emails: For account verification, password resets, reminderes,.


The [WIP] tag indicates this feature is still being developed.



# Support
The README provides an email address (drew@neoprint3d.dev) for support or questions about the project or need help deploying