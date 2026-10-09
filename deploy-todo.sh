#!/bin/bash

# Arrêter le script dès qu'une commande échoue
set -e

# Détection de l'option --migrations
RUN_MIGRATIONS=false
for arg in "$@"; do
  if [ "$arg" == "--migrations" ]; then
    RUN_MIGRATIONS=true
  fi
done

# Configuration des chemins et du dépôt
APP_DIR="/home/qeki3660/public_html/react-p01-todo-app"
TMP_DIR="/home/qeki3660/public_html/react-p01-todo-app_tmp"
API_DIR="sf-todo-api"
GIT_REPO_URL="https://github.com/fagathe-dev/react-p01-todo-app.git"

echo "==> 1. Clonage du dépôt dans le dossier temporaire (${TMP_DIR})..."
rm -rf "$TMP_DIR"
git clone "$GIT_REPO_URL" "$TMP_DIR"

echo "==> 2. Préservation des configurations d'environnement et certificats..."
# Frontend (.env)
if [ -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env" "$TMP_DIR/.env"
  echo "  -> .env (frontend) copié."
fi

# Frontend (.htaccess racine SPA)
if [ -f "$APP_DIR/.htaccess" ]; then
  cp "$APP_DIR/.htaccess" "$TMP_DIR/.htaccess"
  echo "  -> .htaccess (frontend) copié."
fi

# Backend Symfony (.env.local prod)
if [ -f "$APP_DIR/$API_DIR/.env.local" ]; then
  chmod +x "$APP_DIR/$API_DIR/bin/console"
  touch "$APP_DIR/$API_DIR/.env"
  cp "$APP_DIR/$API_DIR/.env.local" "$TMP_DIR/$API_DIR/.env.local"
  echo "  -> $API_DIR/.env.local copié."
fi

# Backend Symfony (clés JWT)
if [ -d "$APP_DIR/$API_DIR/config/jwt" ]; then
  mkdir -p "$TMP_DIR/$API_DIR/config/jwt"
  cp -r "$APP_DIR/$API_DIR/config/jwt/." "$TMP_DIR/$API_DIR/config/jwt/"
  echo "  -> Clés JWT copiées."
fi

echo "==> 3. Build du Frontend (Vite) et passerelle API..."
cd "$TMP_DIR"
npm install
npm run build

# Lien symbolique dist/api -> ../sf-todo-api/public
ln -sfn ../sf-todo-api/public "$TMP_DIR/dist/api"
echo "  -> Lien symbolique dist/api créé."

echo "==> 4. Préparation du Backend Symfony (téléchargement des dépendances)..."
cd "$API_DIR"
# Téléchargement sans exécuter les scripts pour éviter les chemins temporaires
composer install --no-dev --no-scripts --no-interaction

# Retour à la racine utilisateur
cd ../..

echo "==> 5. Bascule atomique du dossier temporaire vers le dossier de production..."
if [ -d "$APP_DIR" ]; then
  rm -rf "${APP_DIR}_old"
  mv "$APP_DIR" "${APP_DIR}_old"
fi
mv "$TMP_DIR" "$APP_DIR"
rm -rf "${APP_DIR}_old"

echo "==> 6. Finalisation dans l'emplacement définitif ($APP_DIR/$API_DIR)..."
cd "$APP_DIR/$API_DIR"

# Autoloader optimisé figé sur le chemin final
composer dump-autoload --optimize --no-dev --classmap-authoritative

# Gestion conditionnelle des migrations
if [ "$RUN_MIGRATIONS" = true ]; then
  echo "  -> Option --migrations détectée : exécution des migrations..."
  php bin/console doctrine:migrations:migrate --no-interaction
else
  echo "  -> Aucune migration exécutée (flag --migrations absent)."
fi

# Préchauffage et régénération du cache Symfony
php bin/console cache:clear --env=prod --no-debug

echo "==> Déploiement terminé avec succès sans coupure !"