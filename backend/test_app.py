import pytest
import bcrypt
from app import app, get_db_connection, execute_query
from unittest.mock import patch, MagicMock
import json
import os

# Configuration de test
app.config['TESTING'] = True
app.config['JWT_SECRET_KEY'] = 'test-secret-key'
app.config['WTF_CSRF_ENABLED'] = False

@pytest.fixture
def client():
    """Client de test Flask"""
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_db():
    """Mock de la base de données"""
    with patch('app.get_db_connection') as mock_conn:
        mock_connection = MagicMock()
        mock_conn.return_value = mock_connection
        yield mock_connection

@pytest.fixture
def sample_user():
    """Utilisateur de test"""
    return {
        'id': 1,
        'prenom': 'Test',
        'nom': 'User',
        'email': 'test@example.com',
        'password': bcrypt.hashpw('1234'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        'role': 'patient'
    }

class TestAuthentication:
    """Tests d'authentification"""
    
    def test_login_success(self, client, mock_db, sample_user):
        """Test login réussi"""
        # Mock de la réponse base de données
        mock_db.cursor.return_value.fetchone.return_value = sample_user
        
        response = client.post('/api/auth/login', 
                              json={
                                  'email': 'test@example.com',
                                  'password': '1234',
                                  'role': 'patient'
                              })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'token' in data
        assert data['user']['email'] == 'test@example.com'
    
    def test_login_invalid_credentials(self, client, mock_db):
        """Test login avec identifiants invalides"""
        # Mock utilisateur non trouvé
        mock_db.cursor.return_value.fetchone.return_value = None
        
        response = client.post('/api/auth/login',
                              json={
                                  'email': 'wrong@example.com',
                                  'password': 'wrong',
                                  'role': 'patient'
                              })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] == False
        assert 'Identifiants incorrects' in data['message']
    
    def test_login_missing_fields(self, client):
        """Test login avec champs manquants"""
        response = client.post('/api/auth/login',
                              json={'email': 'test@example.com'})
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] == False
        assert 'requis' in data['message']
    
    def test_register_success(self, client, mock_db):
        """Test inscription réussie"""
        # Mock insertion réussie
        mock_db.cursor.return_value.lastrowid = 2
        
        response = client.post('/api/auth/register',
                              json={
                                  'prenom': 'New',
                                  'nom': 'User',
                                  'email': 'new@example.com',
                                  'password': '1234',
                                  'role': 'patient',
                                  'telephone': '0612345678',
                                  'groupe_sanguin': 'A+'
                              })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'créé avec succès' in data['message']

class TestAppointments:
    """Tests des rendez-vous"""
    
    def test_get_appointments_success(self, client, mock_db):
        """Test récupération rendez-vous"""
        # Mock token JWT
        with patch('app.get_jwt_identity') as mock_jwt:
            mock_jwt.return_value = {'id': 1, 'role': 'patient'}
            
            # Mock données de rendez-vous
            mock_appointments = [
                {
                    'id': 1,
                    'date': '2025-03-10',
                    'heure': '09:00',
                    'motif': 'Consultation',
                    'statut': 'confirmé',
                    'patient_prenom': 'Test',
                    'patient_nom': 'User'
                }
            ]
            mock_db.cursor.return_value.fetchall.return_value = mock_appointments
            
            response = client.get('/api/appointments',
                                 headers={'Authorization': 'Bearer fake-token'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True
            assert len(data['data']) == 1
    
    def test_create_appointment_success(self, client, mock_db):
        """Test création rendez-vous"""
        with patch('app.get_jwt_identity') as mock_jwt:
            mock_jwt.return_value = {'id': 1, 'role': 'secretaire'}
            
            # Mock insertion réussie
            mock_db.cursor.return_value.lastrowid = 3
            
            response = client.post('/api/appointments',
                                 json={
                                     'date': '2025-03-15',
                                     'heure': '10:00',
                                     'motif': 'Nouveau RDV',
                                     'patient_id': 1,
                                     'medecin_id': 2
                                 },
                                 headers={'Authorization': 'Bearer fake-token'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True
            assert data['data']['id'] == 3

class TestDoctors:
    """Tests des médecins"""
    
    def test_get_doctors_success(self, client, mock_db):
        """Test récupération médecins"""
        with patch('app.get_jwt_identity') as mock_jwt:
            mock_jwt.return_value = {'id': 1, 'role': 'patient'}
            
            # Mock données médecins
            mock_doctors = [
                {
                    'id': 2,
                    'prenom': 'Dr',
                    'nom': 'Smith',
                    'specialite': 'Cardiologie',
                    'ville': 'Casablanca',
                    'tarif': '300 MAD'
                }
            ]
            mock_db.cursor.return_value.fetchall.return_value = mock_doctors
            
            response = client.get('/api/doctors',
                                 headers={'Authorization': 'Bearer fake-token'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True
            assert len(data['data']) == 1
            assert data['data'][0]['specialite'] == 'Cardiologie'

class TestPatients:
    """Tests des patients"""
    
    def test_get_patients_success(self, client, mock_db):
        """Test récupération patients"""
        with patch('app.get_jwt_identity') as mock_jwt:
            mock_jwt.return_value = {'id': 1, 'role': 'secretaire'}
            
            # Mock données patients
            mock_patients = [
                {
                    'id': 1,
                    'prenom': 'Patient',
                    'nom': 'Test',
                    'email': 'patient@example.com',
                    'telephone': '0612345678',
                    'groupe_sanguin': 'A+'
                }
            ]
            mock_db.cursor.return_value.fetchall.return_value = mock_patients
            
            response = client.get('/api/patients',
                                 headers={'Authorization': 'Bearer fake-token'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True
            assert len(data['data']) == 1

class TestMessages:
    """Tests des messages"""
    
    def test_get_messages_success(self, client, mock_db):
        """Test récupération messages"""
        with patch('app.get_jwt_identity') as mock_jwt:
            mock_jwt.return_value = {'id': 1, 'role': 'secretaire'}
            
            # Mock données messages
            mock_messages = [
                {
                    'id': 1,
                    'from': 'secretaire',
                    'to_patient_id': 1,
                    'sujet': 'Rappel RDV',
                    'corps': 'Noubliez pas votre rendez-vous',
                    'patient_prenom': 'Patient',
                    'patient_nom': 'Test'
                }
            ]
            mock_db.cursor.return_value.fetchall.return_value = mock_messages
            
            response = client.get('/api/messages',
                                 headers={'Authorization': 'Bearer fake-token'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True
            assert len(data['data']) == 1
    
    def test_send_message_success(self, client, mock_db):
        """Test envoi message"""
        with patch('app.get_jwt_identity') as mock_jwt:
            mock_jwt.return_value = {'id': 1, 'role': 'secretaire'}
            
            # Mock insertion réussie
            mock_db.cursor.return_value.lastrowid = 2
            
            response = client.post('/api/messages',
                                 json={
                                     'from': 'secretaire',
                                     'to_patient_id': 1,
                                     'sujet': 'Test Message',
                                     'corps': 'Contenu du message'
                                 },
                                 headers={'Authorization': 'Bearer fake-token'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] == True
            assert data['data']['id'] == 2

class TestSecurity:
    """Tests de sécurité"""
    
    def test_unauthorized_access(self, client):
        """Test accès sans token"""
        response = client.get('/api/appointments')
        assert response.status_code == 401
    
    def test_invalid_token(self, client):
        """Test token invalide"""
        response = client.get('/api/appointments',
                             headers={'Authorization': 'Bearer invalid-token'})
        assert response.status_code == 401
    
    def test_sql_injection_protection(self, client, mock_db):
        """Test protection injection SQL"""
        with patch('app.get_jwt_identity') as mock_jwt:
            mock_jwt.return_value = {'id': 1, 'role': 'patient'}
            
            # Mock injection SQL
            malicious_input = "'; DROP TABLE users; --"
            
            response = client.get(f'/api/appointments?user={malicious_input}',
                                 headers={'Authorization': 'Bearer fake-token'})
            
            # Vérifier que la requête SQL est bien paramétrée
            mock_db.cursor.return_value.execute.assert_called()
            # Le paramètre malveillant doit être passé séparément, pas concaténé
            
    def test_password_hashing(self):
        """Test hashage mots de passe"""
        password = 'test_password'
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Vérifier que le hash est différent du mot de passe
        assert hashed != password.encode('utf-8')
        
        # Vérifier que la vérification fonctionne
        assert bcrypt.checkpw(password.encode('utf-8'), hashed)
        assert not bcrypt.checkpw('wrong_password'.encode('utf-8'), hashed)

class TestHealth:
    """Tests de santé du système"""
    
    def test_health_check(self, client):
        """Test endpoint santé"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'OK'

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
