# Local Development Files

This folder contains scripts and files for local testing only. These files are **not** deployed to production.

## Contents

### Test Scripts

- **test-endpoints.ps1** - PowerShell script to test backend endpoints
- **test-endpoints.sh** - Bash script to test backend endpoints

## Usage

### Test Backend Endpoints

From the `backend/` directory:

```bash
npm test
```

Or run directly:

```bash
# PowerShell
pwsh ../local-dev/test-endpoints.ps1

# Bash
bash ../local-dev/test-endpoints.sh
```

### Run Full Dev Environment

From the project root:

```bash
npm run dev:full
```

This runs both frontend (port 3000) and backend (port 3001) concurrently.

## Environment Detection

The app automatically detects if it's running locally:

- **Local**: Uses `http://localhost:3001` for API calls
- **Production**: Uses `https://tipsv.onrender.com` for API calls

See `src/config.js` for the auto-detection logic.
