import pytest
from flask import Flask
from src.dao.DAO import BaseDAO, UserDAO, AppointmentDAO, MessageDAO
from unittest.mock import patch, MagicMock
import mysql.connector

class TestBaseDAO:
    """Tests de la classe BaseDAO"""
    
    @pytest.fixture
    def mock_connection(self):
        """Mock de connexion base de données"""
        with patch('mysql.connector.connect') as mock_connect:
            mock_conn = MagicMock()
            mock_connect.return_value = mock_conn
            yield mock_conn
    
    def test_create_success(self, mock_connection):
        """Test création réussie"""
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 1
        mock_connection.cursor.return_value = mock_cursor
        
        dao = BaseDAO()
        result = dao.create('users', {'name': 'Test', 'email': 'test@example.com'})
        
        assert result == 1
        mock_cursor.execute.assert_called_once()
        mock_connection.commit.assert_called_once()
    
    def test_create_failure(self, mock_connection):
        """Test création échouée"""
        mock_connection.cursor.side_effect = mysql.connector.Error("DB Error")
        
        dao = BaseDAO()
        result = dao.create('users', {'name': 'Test'})
        
        assert result is None
    
    def test_read_success(self, mock_connection):
        """Test lecture réussie"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [{'id': 1, 'name': 'Test'}]
        mock_connection.cursor.return_value = mock_cursor
        
        dao = BaseDAO()
        result = dao.read('users', {'name': 'Test'})
        
        assert len(result) == 1
        assert result[0]['name'] == 'Test'
    
    def test_update_success(self, mock_connection):
        """Test mise à jour réussie"""
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_connection.cursor.return_value = mock_cursor
        
        dao = BaseDAO()
        result = dao.update('users', {'name': 'Updated'}, {'id': 1})
        
        assert result == 1
        mock_connection.commit.assert_called_once()
    
    def test_delete_success(self, mock_connection):
        """Test suppression réussie"""
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_connection.cursor.return_value = mock_cursor
        
        dao = BaseDAO()
        result = dao.delete('users', {'id': 1})
        
        assert result == 1
        mock_connection.commit.assert_called_once()

class TestUserDAO:
    """Tests de la classe UserDAO"""
    
    @pytest.fixture
    def user_dao(self):
        """Instance de UserDAO"""
        return UserDAO()
    
    @pytest.fixture
    def mock_connection(self):
        """Mock de connexion base de données"""
        with patch('mysql.connector.connect') as mock_connect:
            mock_conn = MagicMock()
            mock_connect.return_value = mock_conn
            yield mock_conn
    
    def test_create_user_success(self, user_dao, mock_connection):
        """Test création utilisateur réussie"""
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 1
        mock_connection.cursor.return_value = mock_cursor
        
        user_data = {
            'prenom': 'Test',
            'nom': 'User',
            'email': 'test@example.com',
            'password': 'hashed_password',
            'role': 'patient'
        }
        
        result = user_dao.create(user_data)
        assert result == 1
    
    def test_find_by_email_success(self, user_dao, mock_connection):
        """Test recherche par email réussie"""
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {
            'id': 1,
            'email': 'test@example.com',
            'role': 'patient'
        }
        mock_connection.cursor.return_value = mock_cursor
        
        result = user_dao.findByEmail('test@example.com')
        assert result is not None
        assert result['email'] == 'test@example.com'
    
    def test_find_by_email_not_found(self, user_dao, mock_connection):
        """Test recherche par email non trouvée"""
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_connection.cursor.return_value = mock_cursor
        
        result = user_dao.findByEmail('notfound@example.com')
        assert result is None
    
    def test_find_by_role_success(self, user_dao, mock_connection):
        """Test recherche par rôle réussie"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            {'id': 1, 'prenom': 'Dr', 'nom': 'Smith', 'role': 'medecin'},
            {'id': 2, 'prenom': 'Dr', 'nom': 'Jones', 'role': 'medecin'}
        ]
        mock_connection.cursor.return_value = mock_cursor
        
        result = user_dao.findByRole('medecin')
        assert len(result) == 2
        assert all(user['role'] == 'medecin' for user in result)

class TestAppointmentDAO:
    """Tests de la classe AppointmentDAO"""
    
    @pytest.fixture
    def appointment_dao(self):
        """Instance de AppointmentDAO"""
        return AppointmentDAO()
    
    @pytest.fixture
    def mock_connection(self):
        """Mock de connexion base de données"""
        with patch('mysql.connector.connect') as mock_connect:
            mock_conn = MagicMock()
            mock_connect.return_value = mock_conn
            yield mock_conn
    
    def test_create_appointment_success(self, appointment_dao, mock_connection):
        """Test création rendez-vous réussie"""
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 1
        mock_connection.cursor.return_value = mock_cursor
        
        appointment_data = {
            'date': '2025-03-15',
            'heure': '10:00',
            'motif': 'Consultation',
            'patient_id': 1,
            'medecin_id': 2
        }
        
        result = appointment_dao.create(appointment_data)
        assert result == 1
    
    def test_find_by_patient_success(self, appointment_dao, mock_connection):
        """Test recherche rendez-vous par patient"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            {'id': 1, 'date': '2025-03-15', 'patient_id': 1},
            {'id': 2, 'date': '2025-03-16', 'patient_id': 1}
        ]
        mock_connection.cursor.return_value = mock_cursor
        
        result = appointment_dao.findByPatient(1)
        assert len(result) == 2
        assert all(appt['patient_id'] == 1 for appt in result)
    
    def test_find_by_medecin_success(self, appointment_dao, mock_connection):
        """Test recherche rendez-vous par médecin"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            {'id': 1, 'date': '2025-03-15', 'medecin_id': 2},
            {'id': 3, 'date': '2025-03-17', 'medecin_id': 2}
        ]
        mock_connection.cursor.return_value = mock_cursor
        
        result = appointment_dao.findByMedecin(2)
        assert len(result) == 2
        assert all(appt['medecin_id'] == 2 for appt in result)
    
    def test_update_status_success(self, appointment_dao, mock_connection):
        """Test mise à jour statut rendez-vous"""
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_connection.cursor.return_value = mock_cursor
        
        result = appointment_dao.updateStatus(1, 'confirmé')
        assert result == 1

class TestMessageDAO:
    """Tests de la classe MessageDAO"""
    
    @pytest.fixture
    def message_dao(self):
        """Instance de MessageDAO"""
        return MessageDAO()
    
    @pytest.fixture
    def mock_connection(self):
        """Mock de connexion base de données"""
        with patch('mysql.connector.connect') as mock_connect:
            mock_conn = MagicMock()
            mock_connect.return_value = mock_conn
            yield mock_conn
    
    def test_create_message_success(self, message_dao, mock_connection):
        """Test création message réussie"""
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 1
        mock_connection.cursor.return_value = mock_cursor
        
        message_data = {
            'from': 'secretaire',
            'to_patient_id': 1,
            'sujet': 'Rappel',
            'corps': 'Noubliez pas votre RDV'
        }
        
        result = message_dao.create(message_data)
        assert result == 1
    
    def test_find_by_patient_success(self, message_dao, mock_connection):
        """Test recherche messages par patient"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            {'id': 1, 'sujet': 'Rappel', 'to_patient_id': 1},
            {'id': 2, 'sujet': 'Confirmation', 'to_patient_id': 1}
        ]
        mock_connection.cursor.return_value = mock_cursor
        
        result = message_dao.findByPatient(1)
        assert len(result) == 2
        assert all(msg['to_patient_id'] == 1 for msg in result)
    
    def test_mark_as_read_success(self, message_dao, mock_connection):
        """Test marquer message comme lu"""
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_connection.cursor.return_value = mock_cursor
        
        result = message_dao.markAsRead(1)
        assert result == 1

class TestDAOIntegration:
    """Tests d'intégration DAO"""
    
    @pytest.fixture
    def mock_connection(self):
        """Mock de connexion base de données"""
        with patch('mysql.connector.connect') as mock_connect:
            mock_conn = MagicMock()
            mock_connect.return_value = mock_conn
            yield mock_conn
    
    def test_user_appointment_relationship(self, mock_connection):
        """Test relation utilisateur-rendez-vous"""
        # Mock utilisateur
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {'id': 1, 'role': 'patient'}
        mock_connection.cursor.return_value = mock_cursor
        
        user_dao = UserDAO()
        user = user_dao.findByEmail('patient@example.com')
        
        # Mock rendez-vous du patient
        mock_cursor.fetchall.return_value = [
            {'id': 1, 'date': '2025-03-15', 'patient_id': 1}
        ]
        
        appointment_dao = AppointmentDAO()
        appointments = appointment_dao.findByPatient(user['id'])
        
        assert len(appointments) == 1
        assert appointments[0]['patient_id'] == user['id']
    
    def test_message_patient_relationship(self, mock_connection):
        """Test relation message-patient"""
        # Mock patient
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {'id': 1, 'role': 'patient'}
        mock_connection.cursor.return_value = mock_cursor
        
        user_dao = UserDAO()
        patient = user_dao.findByEmail('patient@example.com')
        
        # Mock messages pour le patient
        mock_cursor.fetchall.return_value = [
            {'id': 1, 'sujet': 'Rappel', 'to_patient_id': 1}
        ]
        
        message_dao = MessageDAO()
        messages = message_dao.findByPatient(patient['id'])
        
        assert len(messages) == 1
        assert messages[0]['to_patient_id'] == patient['id']

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
