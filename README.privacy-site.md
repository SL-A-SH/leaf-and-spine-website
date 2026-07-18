# Leaf & Spine - Privacy Policy Website

A simple, professional privacy policy website for the Leaf & Spine book reading app.

## Features

- Clean, modern design with gradient background
- Mobile responsive layout
- Professional privacy policy page ready for Play Store and App Store submissions
- Optimized for GitHub Pages deployment

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Deployment to GitHub Pages

### Option 1: Automatic Deployment with GitHub Actions

1. Create a new repository on GitHub
2. Push your code to the repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

3. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Under "Build and deployment", select "GitHub Actions" as the source

4. The site will automatically deploy on every push to the main branch!

### Option 2: Manual Deployment

Run the deploy script:
```bash
npm run deploy
```

## Custom Domain Setup

To use your custom domain with GitHub Pages:

1. Go to your repository Settings → Pages
2. Under "Custom domain", enter your domain name
3. Add these DNS records at your domain registrar:
   - For apex domain (example.com):
     ```
     Type: A
     Host: @
     Value: 185.199.108.153
     Value: 185.199.109.153
     Value: 185.199.110.153
     Value: 185.199.111.153
     ```
   - For www subdomain:
     ```
     Type: CNAME
     Host: www
     Value: YOUR_USERNAME.github.io
     ```

4. Wait for DNS propagation (can take up to 24 hours)
5. Enable "Enforce HTTPS" in repository settings

## Important Configuration

**Before deploying, update the `base` path in `vite.config.js`:**

```javascript
base: '/your-repo-name/',
```

If using a custom domain, change it to:
```javascript
base: '/',
```

## Contact Email

Don't forget to update the contact email in the Privacy Policy section of the website. Currently set to: `contact@leafandspine.com`

Edit this in `src/App.jsx` at line 53.

## Technologies Used

- React 19
- Vite
- GitHub Pages
- GitHub Actions

## License

© 2026 Leaf & Spine. All rights reserved.
