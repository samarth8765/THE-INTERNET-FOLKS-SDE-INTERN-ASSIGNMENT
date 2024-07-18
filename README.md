<h1 align="center"> The Internet Folks: SDE Intern Assignment [002] </h1>

## Local Development

### With Docker

1. Clone the repository:

   ```
   git clone https://github.com/samarth8765/the-internet-folks-sde-intern-assignment
   ```

2. Navigate to the project directory:

   ```
   cd the-internet-folks-sde-intern-assignment
   ```

3. Run the following command to start the application:

   ```
   docker compose up
   ```

### Without Docker

1. Clone the repository:

   ```
   git clone https://github.com/samarth8765/the-internet-folks-sde-intern-assignment
   ```

2. Navigate to the project directory:

   ```
   cd the-internet-folks-sde-intern-assignment
   ```

3. Create a `.env` file based on the `.env.example` file and configure the `DATABASE_URL` and `JWT_SECRET` with your postgreSQL connection string.

4. Install the dependencies:
   ```
   npm install -g pnpm
   pnpm install
   ```
5. Run database migrations:
   ```
   pnpm run prisma:migrate
   ```
6. Seed the database (optional):
   ```
   pnpm run db:seed
   ```
7. Start the development server:
   ```
   pnpm run dev
   ```

- For API routes and documentation, refer to the provided link: [API Routes Documentation](https://documenter.getpostman.com/view/14439156/2s93Jrx5Da#3f8eef19-fe2f-458b-bde7-a7abe9fcefa3)

- Test the api using the Live Link -> https://api-saas.samarthdhawan.com
