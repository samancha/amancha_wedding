# Amancha Wedding Site Deployment Agent

This document outlines the deployment process for the Amancha Wedding website, intended to be used by a deployment agent.

## Deployment Environment

The website is a Next.js application deployed on Vercel.

## Deployment Steps

The deployment process is managed by Vercel and configured in `vercel.json`. The standard Vercel deployment flow for a Next.js application should be followed.

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Build Application:**

    ```bash
    npm run build
    ```

3.  **Deploy:**
    The deployment is handled automatically by Vercel when changes are pushed to the connected Git repository. The `vercel.json` file specifies the build command and output directory.

## Key Configuration Files

- `package.json`: Defines the project scripts, including `build`, `dev`, and `start`.
- `vercel.json`: Configures the Vercel deployment settings, such as the framework and build commands.
- `next.config.ts`: Next.js specific configuration.
