# Синхронизация с GitHub

Папка была скачана без истории Git. Чтобы снова связать проект с вашим репозиторием:

## 1. Установите Git (если ещё не установлен)

- Скачайте: https://git-scm.com/download/win  
- Установите и **перезапустите Cursor** (или откройте новый терминал).

## 2. Откройте терминал в папке проекта

В Cursor: **Terminal → New Terminal** (уже будет в `leakfixer-miniapp`).

## 3. Выполните команды по порядку

Подставьте вместо `ВАШ_USERNAME` и `leakfixer-miniapp` (если репозиторий называется иначе) свои данные.

```powershell
git init
git add .
git commit -m "Restore project from download"
git remote add origin https://github.com/ВАШ_USERNAME/leakfixer-miniapp.git
git branch -M main
git pull origin main --rebase
git push -u origin main
```

Если основная ветка у вас `master`, замените `main` на `master` в двух последних строках.

## 4. Дальнейшая синхронизация

- **Отправить изменения на GitHub:** в Cursor нажмите **Source Control** (иконка ветки слева или `Ctrl+Shift+G`) → введите сообщение коммита → **Commit** → **Sync Changes** (или **Push**).
- Либо в терминале:
  ```powershell
  git add .
  git commit -m "Описание изменений"
  git push
  ```

После этого все изменения можно будет синхронизировать с репозиторием через Cursor или терминал.
