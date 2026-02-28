# GitHub Sync Guide

If your project folder was downloaded without Git history, use these steps to reconnect it to your GitHub repository.

## 1. Install Git (if needed)

- Download: https://git-scm.com/download/win
- Install it and restart your terminal/IDE.

## 2. Open a terminal in the project folder

In Cursor: **Terminal -> New Terminal** (inside `leakfixer-miniapp`).

## 3. Run setup commands

Replace `YOUR_USERNAME` and repository name if needed.

```powershell
git init
git add .
git commit -m "Restore project from download"
git remote add origin https://github.com/YOUR_USERNAME/leakfixer-miniapp.git
git branch -M main
git pull origin main --rebase
git push -u origin main
```

If your default branch is `master`, replace `main` with `master` in the last two commands.

## 4. Daily sync workflow

### Via IDE UI

- Open **Source Control** (`Ctrl+Shift+G`).
- Enter commit message.
- Click **Commit**.
- Click **Sync Changes** (or **Push**).

### Via terminal

```powershell
git add .
git commit -m "Describe your changes"
git push
```

After this, your local changes will sync with GitHub normally.
