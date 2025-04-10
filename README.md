# React SPA Sample

A React Single Page Application with authentication and role-based access control.

## Features

- User authentication with JWT
- Role-based access control (Admin, Supervisor, Staff, Driver)
- Dashboard with sales reports
- Employee management
- Delivery reports for drivers
- Responsive design

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The workflow automatically builds, tests, and deploys the application whenever changes are pushed to the main branch.

### Deployment Options

#### 1. Deploy to VPS Linux Server

The application can be deployed to a VPS Linux server using the `.github/workflows/vps-deploy.yml` workflow.

**Setup Instructions:**

1. **Configure VPS Server:**
   - Set up a VPS with Ubuntu/Debian
   - Install Nginx or Apache web server
   - Configure the web server to serve static files from `/var/www/html`

2. **Configure GitHub Secrets:**
   - Go to your repository settings
   - Navigate to "Secrets and variables" > "Actions"
   - Add the following secrets:
     - `VPS_HOST`: Your VPS server IP address or domain
     - `VPS_USERNAME`: SSH username for your VPS
     - `VPS_SSH_KEY`: Your private SSH key for connecting to the VPS

3. **Generate SSH Key (if needed):**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```
   - Add the public key to your VPS's `~/.ssh/authorized_keys`
   - Add the private key to GitHub secrets as `VPS_SSH_KEY`

4. **Push to Main Branch:**
   - The workflow will automatically deploy to your VPS when you push to the main branch

#### 2. Deploy to GitHub Pages

The application can also be deployed to GitHub Pages using the `.github/workflows/ci-cd.yml` workflow.

**Setup Instructions:**

1. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages"
   - Select the "gh-pages" branch as the source
   - Save the changes

2. **Configure Secrets (if using other deployment options):**
   - Go to your repository settings
   - Navigate to "Secrets and variables" > "Actions"
   - Add the following secrets if you want to use Netlify or Vercel:
     - `NETLIFY_AUTH_TOKEN`
     - `NETLIFY_SITE_ID`
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`

3. **Uncomment Deployment Options:**
   - Edit the `.github/workflows/ci-cd.yml` file
   - Uncomment the deployment section for your preferred hosting service

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to `http://localhost:5173`

## Build for Production

Run `npm run build` to create a production build in the `dist` directory.

## License

MIT
