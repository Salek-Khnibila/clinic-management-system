@echo off
echo Installation du Backend Flask pour Gestion Clinique
echo.

echo 1. Creation de l'environnement virtuel...
python -m venv venv

echo 2. Activation de l'environnement...
call venv\Scripts\activate

echo 3. Installation des dependances...
pip install -r requirements.txt

echo 4. Configuration de l'environnement...
if not exist .env (
    copy .env.example .env
    echo Fichier .env cree. Veuillez l'editer avec vos configurations MySQL.
)

echo.
echo Installation terminee!
echo.
echo Prochaines etapes:
echo 1. Configurez votre base de donnees MySQL
echo 2. Importez: mysql -u root -p < ../database/schema.sql
echo 3. Importez: mysql -u root -p gestion_clinique < ../database/sample-data.sql
echo 4. Editez .env avec vos configurations MySQL
echo 5. Demarrez: python app.py
echo.
pause
