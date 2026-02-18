# Alexandria Library

Frontend project powered by Vite + React.

## Create GitHub Repository

1. Open `https://github.com/new`.
2. Repository name: `alexandria-library`.
3. Keep the repository empty (do not add README, `.gitignore`, or license).
4. Copy your repo URL:
   - HTTPS: `https://github.com/<your-username>/alexandria-library.git`
   - SSH: `git@github.com:<your-username>/alexandria-library.git`

## Push This Project to GitHub

Run from the project root:

```bash
cd /home/tkrybakova/alexandria-library
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/alexandria-library.git
git push -u origin main
```

If `origin` already exists, update it:

```bash
git remote set-url origin https://github.com/<your-username>/alexandria-library.git
git push -u origin main
```

## Run Locally

Requirements:
- Node.js 20+ and npm

Install and start:

```bash
cd /home/tkrybakova/alexandria-library
npm install
npm run dev
```

Open in browser: `http://localhost:5173`

## Useful Scripts

- `npm run dev` - start development server
- `npm run build` - build production assets
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint
- `npm run lint:fix` - fix lint issues automatically
- `npm run typecheck` - run TypeScript checks via `jsconfig.json`
