import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing asset paths in built files...');

const distPath = path.join(process.cwd(), 'dist');
const indexPath = path.join(distPath, 'index.html');

try {
  // Read the index.html file
  let html = fs.readFileSync(indexPath, 'utf8');
  
  console.log('📖 Reading index.html...');
  
  // Fix asset paths - remove leading slashes to make them relative
  html = html.replace(/src="\/assets\//g, 'src="./assets/');
  html = html.replace(/href="\/assets\//g, 'href="./assets/');
  
  // Also fix any other absolute paths
  html = html.replace(/src="\//g, 'src="./');
  html = html.replace(/href="\//g, 'href="./');
  
  // Write the fixed HTML back
  fs.writeFileSync(indexPath, html, 'utf8');
  
  console.log('✅ Asset paths fixed successfully!');
  console.log('📁 Fixed file: dist/index.html');
  
  // Create a simple server configuration
  const serverConfig = `
# Simple server configuration for aapanel
# Copy this to your aapanel Nginx configuration

server {
    listen 80;
    server_name your-domain.com;
    root /www/wwwroot/your-domain;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
`;
  
  fs.writeFileSync(path.join(distPath, 'nginx.conf'), serverConfig);
  console.log('📝 Created nginx.conf for aapanel');
  
  // Create deployment info
  const deploymentInfo = `
# 🚀 Fynito Admin Portal - Ready for Deployment

## 📁 What's in this folder:
- index.html (main application)
- assets/ (CSS, JS, images)
- nginx.conf (Nginx configuration for aapanel)

## 🚀 To deploy to aapanel:

1. Upload all files to your aapanel site directory
2. Copy nginx.conf content to your aapanel Nginx settings
3. Set proper permissions: chmod -R 755 /path/to/site
4. Your app will be accessible at your domain

## 🔧 Alternative: Simple static server
If you prefer not to use Nginx, you can run:
npm install -g serve
serve -s . -l 3000

## 📱 Your app is now ready to serve!
`;
  
  fs.writeFileSync(path.join(distPath, 'DEPLOYMENT.md'), deploymentInfo);
  console.log('📖 Created DEPLOYMENT.md with instructions');
  
} catch (error) {
  console.error('❌ Error fixing assets:', error.message);
  process.exit(1);
}
