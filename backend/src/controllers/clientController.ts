import { Request, Response } from 'express';
import pool from '../config/database';
import bcrypt from 'bcryptjs';

export async function listClients(req: Request, res: Response) {
  try {
    const result = await pool.query(
      'SELECT id, name, panel_username, renewal_cost, status, created_at FROM clients ORDER BY created_at DESC'
    );

    res.json({
      clients: result.rows,
      total: result.rows.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createClient(req: Request, res: Response) {
  try {
    const { name, panelUsername, panelPassword, renewalCost } = req.body;

    if (!name || !panelUsername || !panelPassword || !renewalCost) {
      return res.status(400).json({
        error: 'Nome, usuário painel, senha painel e valor de renovação são obrigatórios',
      });
    }

    // Encriptar senha
    const hashedPassword = await bcrypt.hash(panelPassword, 10);

    const result = await pool.query(
      'INSERT INTO clients (name, panel_username, panel_password_encrypted, renewal_cost, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, panelUsername, hashedPassword, renewalCost, 'active']
    );

    res.status(201).json({
      message: 'Cliente criado com sucesso',
      client: result.rows[0],
    });
  } catch (error: any) {
    console.error('[Client] Erro ao criar cliente:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateClient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, panelUsername, panelPassword, renewalCost, status } = req.body;

    let updateQuery = 'UPDATE clients SET updated_at = NOW()';
    const params: any[] = [];
    let paramCount = 1;

    if (name) {
      updateQuery += `, name = $${paramCount++}`;
      params.push(name);
    }

    if (panelUsername) {
      updateQuery += `, panel_username = $${paramCount++}`;
      params.push(panelUsername);
    }

    if (panelPassword) {
      const hashedPassword = await bcrypt.hash(panelPassword, 10);
      updateQuery += `, panel_password_encrypted = $${paramCount++}`;
      params.push(hashedPassword);
    }

    if (renewalCost) {
      updateQuery += `, renewal_cost = $${paramCount++}`;
      params.push(renewalCost);
    }

    if (status) {
      updateQuery += `, status = $${paramCount++}`;
      params.push(status);
    }

    updateQuery += ` WHERE id = $${paramCount++} RETURNING *`;
    params.push(id);

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      message: 'Cliente atualizado com sucesso',
      client: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteClient(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      message: 'Cliente deletado com sucesso',
      clientId: result.rows[0].id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getClientPayments(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM payments WHERE client_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      clientId: id,
      payments: result.rows,
      total: result.rows.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
