import pool from '../config/database';

async function migrate() {
  try {
    console.log('Iniciando migrations...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabela users criada');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        panel_username VARCHAR(255) NOT NULL,
        panel_password_encrypted VARCHAR(255) NOT NULL,
        renewal_cost DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabela clients criada');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        pix_qr_code TEXT,
        pix_transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP
      )
    `);
    console.log('✓ Tabela payments criada');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabela chat_messages criada');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS renewal_logs (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabela renewal_logs criada');

    console.log('Migrations concluídas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar migrations:', error);
    process.exit(1);
  }
}

migrate();
