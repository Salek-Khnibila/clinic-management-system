// ============================================
// Pattern DAO - Data Access Object
// ============================================

/**
 * Base DAO interface defining standard CRUD operations
 * All specific DAOs should extend this interface
 */
export class BaseDAO {
  constructor(connection) {
    this.connection = connection;
  }

  // CRUD operations that all entities should have
  async create(data) {
    throw new Error('create() must be implemented by subclass');
  }

  async findById(id) {
    throw new Error('findById() must be implemented by subclass');
  }

  async findAll() {
    throw new Error('findAll() must be implemented by subclass');
  }

  async update(id, data) {
    throw new Error('update() must be implemented by subclass');
  }

  async delete(id) {
    throw new Error('delete() must be implemented by subclass');
  }

  // Common utility methods
  async executeQuery(query, params = []) {
    try {
      const [rows] = await this.connection.execute(query, params);
      return rows;
    } catch (error) {
      console.error(`Database query error: ${error.message}`);
      throw error;
    }
  }

  async executeQueryOne(query, params = []) {
    try {
      const [rows] = await this.connection.execute(query, params);
      return rows[0] || null;
    } catch (error) {
      console.error(`Database query error: ${error.message}`);
      throw error;
    }
  }
}

/**
 * User DAO - Handles all user-related database operations
 */
export class UserDAO extends BaseDAO {
  constructor(connection) {
    super(connection);
  }

  async create(userData) {
    const query = `
      INSERT INTO users (prenom, nom, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      userData.prenom,
      userData.nom,
      userData.email,
      userData.password, // Should be hashed before calling
      userData.role
    ];
    
    const result = await this.executeQuery(query, params);
    return result.insertId;
  }

  async findById(id) {
    const query = `
      SELECT id, prenom, nom, email, role
      FROM users
      WHERE id = ?
    `;
    return await this.executeQueryOne(query, [id]);
  }

  async findByEmail(email) {
    const query = `
      SELECT id, prenom, nom, email, password, role
      FROM users
      WHERE email = ?
    `;
    return await this.executeQueryOne(query, [email]);
  }

  async findAll() {
    const query = `
      SELECT id, prenom, nom, email, role
      FROM users
      ORDER BY nom, prenom
    `;
    return await this.executeQuery(query);
  }

  async update(id, userData) {
    const query = `
      UPDATE users
      SET prenom = ?, nom = ?, email = ?, role = ?
      WHERE id = ?
    `;
    const params = [
      userData.prenom,
      userData.nom,
      userData.email,
      userData.role,
      id
    ];
    
    const result = await this.executeQuery(query, params);
    return result.affectedRows > 0;
  }

  async updatePassword(id, hashedPassword) {
    const query = `
      UPDATE users
      SET password = ?
      WHERE id = ?
    `;
    const params = [hashedPassword, id];
    
    const result = await this.executeQuery(query, params);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const query = `DELETE FROM users WHERE id = ?`;
    const result = await this.executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  async findByRole(role) {
    const query = `
      SELECT id, prenom, nom, email
      FROM users
      WHERE role = ?
      ORDER BY nom, prenom
    `;
    return await this.executeQuery(query, [role]);
  }
}

/**
 * Appointment DAO - Handles all appointment-related database operations
 */
export class AppointmentDAO extends BaseDAO {
  constructor(connection) {
    super(connection);
  }

  async create(appointmentData) {
    const query = `
      INSERT INTO appointments (date, heure, motif, statut, patient_id, medecin_id, arrivee)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      appointmentData.date,
      appointmentData.heure,
      appointmentData.motif,
      appointmentData.statut || 'en attente',
      appointmentData.patient_id,
      appointmentData.medecin_id,
      appointmentData.arrivee || 'en attente'
    ];
    
    const result = await this.executeQuery(query, params);
    return result.insertId;
  }

  async findById(id) {
    const query = `
      SELECT a.*, 
             p.prenom as patient_prenom, p.nom as patient_nom,
             m.prenom as medecin_prenom, m.nom as medecin_nom
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users m ON a.medecin_id = m.id
      WHERE a.id = ?
    `;
    return await this.executeQueryOne(query, [id]);
  }

  async findByPatientId(patientId) {
    const query = `
      SELECT a.*, 
             m.prenom as medecin_prenom, m.nom as medecin_nom, m.specialite
      FROM appointments a
      LEFT JOIN users m ON a.medecin_id = m.id
      WHERE a.patient_id = ?
      ORDER BY a.date DESC, a.heure DESC
    `;
    return await this.executeQuery(query, [patientId]);
  }

  async findByMedecinId(medecinId, date = null) {
    let query = `
      SELECT a.*, 
             p.prenom as patient_prenom, p.nom as patient_nom
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      WHERE a.medecin_id = ?
    `;
    const params = [medecinId];

    if (date) {
      query += ` AND a.date = ?`;
      params.push(date);
    }

    query += ` ORDER BY a.date, a.heure`;
    
    return await this.executeQuery(query, params);
  }

  async findAll() {
    const query = `
      SELECT a.*, 
             p.prenom as patient_prenom, p.nom as patient_nom,
             m.prenom as medecin_prenom, m.nom as medecin_nom, m.specialite
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users m ON a.medecin_id = m.id
      ORDER BY a.date DESC, a.heure DESC
    `;
    return await this.executeQuery(query);
  }

  async update(id, appointmentData) {
    const fields = [];
    const params = [];

    // Build dynamic update query
    Object.keys(appointmentData).forEach(key => {
      if (appointmentData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(appointmentData[key]);
      }
    });

    if (fields.length === 0) return false;

    const query = `
      UPDATE appointments
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    params.push(id);

    const result = await this.executeQuery(query, params);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const query = `DELETE FROM appointments WHERE id = ?`;
    const result = await this.executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  async findAvailableSlots(medecinId, date) {
    const query = `
      SELECT a.heure
      FROM appointments a
      WHERE a.medecin_id = ? 
        AND a.date = ? 
        AND a.statut NOT IN ('annulé')
      ORDER BY a.heure
    `;
    
    const bookedSlots = await this.executeQuery(query, [medecinId, date]);
    
    // Define all possible slots
    const allSlots = [
      ...['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'], // Morning
      ...['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']  // Afternoon
    ];
    
    const bookedHours = bookedSlots.map(slot => slot.heure);
    return allSlots.filter(slot => !bookedHours.includes(slot));
  }
}

/**
 * Message DAO - Handles all message-related database operations
 */
export class MessageDAO extends BaseDAO {
  constructor(connection) {
    super(connection);
  }

  async create(messageData) {
    const query = `
      INSERT INTO messages (from, to_patient_id, sujet, corps, date)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      messageData.from,
      messageData.to_patient_id,
      messageData.sujet,
      messageData.corps,
      messageData.date || new Date().toISOString().split('T')[0]
    ];
    
    const result = await this.executeQuery(query, params);
    return result.insertId;
  }

  async findById(id) {
    const query = `
      SELECT m.*, p.prenom as patient_prenom, p.nom as patient_nom
      FROM messages m
      LEFT JOIN users p ON m.to_patient_id = p.id
      WHERE m.id = ?
    `;
    return await this.executeQueryOne(query, [id]);
  }

  async findByPatientId(patientId) {
    const query = `
      SELECT *
      FROM messages
      WHERE to_patient_id = ?
      ORDER BY date DESC
    `;
    return await this.executeQuery(query, [patientId]);
  }

  async findAll() {
    const query = `
      SELECT m.*, p.prenom as patient_prenom, p.nom as patient_nom
      FROM messages m
      LEFT JOIN users p ON m.to_patient_id = p.id
      ORDER BY m.date DESC
    `;
    return await this.executeQuery(query);
  }

  async markAsRead(id) {
    const query = `
      UPDATE messages
      SET lu = true
      WHERE id = ?
    `;
    const result = await this.executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  async findUnreadCount(patientId) {
    const query = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE to_patient_id = ? AND lu = false
    `;
    const result = await this.executeQueryOne(query, [patientId]);
    return result ? result.count : 0;
  }

  async update(id, messageData) {
    const fields = [];
    const params = [];

    Object.keys(messageData).forEach(key => {
      if (messageData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(messageData[key]);
      }
    });

    if (fields.length === 0) return false;

    const query = `
      UPDATE messages
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    params.push(id);

    const result = await this.executeQuery(query, params);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const query = `DELETE FROM messages WHERE id = ?`;
    const result = await this.executeQuery(query, [id]);
    return result.affectedRows > 0;
  }
}

export default {
  BaseDAO,
  UserDAO,
  AppointmentDAO,
  MessageDAO
};
