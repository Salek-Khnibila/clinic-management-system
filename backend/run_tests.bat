@echo off
echo Execution des Tests Unitaires - Backend Flask
echo.

echo 1. Activation de l'environnement virtuel...
call venv\Scripts\activate

echo 2. Installation des dependances de test...
pip install -r requirements.txt

echo.
echo 3. Tests des Services API (test_app.py)...
echo ============================================
pytest test_app.py -v --tb=short

echo.
echo 4. Tests du Pattern DAO (test_dao.py)...
echo ============================================
pytest test_dao.py -v --tb=short

echo.
echo 5. Tests Frontend E2E (test_frontend.py)...
echo ============================================
echo Note: Ces tests necessitent que le frontend soit demarre sur http://localhost:5173
pytest test_frontend.py -v --tb=short --tb=line

echo.
echo 6. Generation du rapport de couverture...
echo ============================================
coverage run -m pytest test_app.py test_dao.py -v
coverage report -m
coverage html

echo.
echo 7. Tests de securite specifiques...
echo ============================================
pytest test_app.py::TestSecurity -v

echo.
echo Tests termines!
echo - Rapport de couverture: htmlcov/index.html
echo - Logs detailles dans le dossier .pytest_cache/
echo.
pause
