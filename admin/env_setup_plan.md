# Admin Panel Deployment Configuration

## 1. Environment Variables in Admin Panel

### `d:\infinityhealth\infinityhealth2\admin\.env` (Local Development)
```env
VITE_API_URL=http://localhost:3000
```

### `d:\infinityhealth\infinityhealth2\admin\.env.production` (Server Deployment)
```env
VITE_API_URL=http://147.50.228.99:5000
```
> **Note:** We are using port 5000 for production as indicated by your `setup_server.sh` firewall rules.

## 2. Code Modification

### `d:\infinityhealth\infinityhealth2\admin\src\services\api.ts`
Modify the axios instantiation to use the environment variable:
```typescript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', // Fallback
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
```

## 3. Build Process
Run `npm run build` to generate the static files in `dist/`.

## 4. Deployment
Upload the contents of `dist/` to `/var/www/infinityhealth/admin` (or configured web root) on the server.
