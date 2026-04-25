import { Request, Response } from 'express';
import pool from '../config/database';
import { generateGeminiResponse, detectPaymentRequest } from '../services/geminiService';
import { generatePixQRCode } from '../services/efiService';

export async function sendMessage(req: Request, res: Response) {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId e message são obrigatórios' });
    }

    console.log(`[Chat] Nova mensagem de ${sessionId}: ${message}`);

    // Salvar mensagem do usuário
    await pool.query(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
      [sessionId, 'user', message]
    );

    // Obter histórico da conversa
    const historyResult = await pool.query(
      'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 10',
      [sessionId]
    );

    const history = historyResult.rows.reverse().map((row: any) => ({
      role: row.role === 'user' ? 'user' : 'model',
      parts: [{ text: row.content }],
    }));

    // Gerar resposta da IA
    const aiResponse = await generateGeminiResponse(message, history);

    // Salvar resposta da IA
    await pool.query(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
      [sessionId, 'assistant', aiResponse]
    );

    let responseData: any = {
      role: 'assistant',
      content: aiResponse,
      sessionId,
    };

    // Detectar se cliente está tentando pagar
    if (detectPaymentRequest(message)) {
      console.log('[Chat] Solicitação de pagamento detectada');

      // Buscar cliente por sessão (assumindo que sessionId = clientId para simplificar)
      const clientResult = await pool.query(
        'SELECT id, renewal_cost FROM clients WHERE id = $1',
        [parseInt(sessionId)]
      );

      if (clientResult.rows.length > 0) {
        const client = clientResult.rows[0];
        const { qrCode, transactionId } = await generatePixQRCode(client.id, client.renewal_cost);

        // Salvar pagamento pendente
        await pool.query(
          'INSERT INTO payments (client_id, amount, status, pix_qr_code, pix_transaction_id) VALUES ($1, $2, $3, $4, $5)',
          [client.id, client.renewal_cost, 'pending', qrCode, transactionId]
        );

        responseData.pixQRCode = qrCode;
        responseData.transactionId = transactionId;
        responseData.amount = client.renewal_cost;
        responseData.waitingForPayment = true;
      }
    }

    res.json(responseData);
  } catch (error: any) {
    console.error('[Chat] Erro:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getChatHistory(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;

    const result = await pool.query(
      'SELECT role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    res.json({
      sessionId,
      messages: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createSession(req: Request, res: Response) {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      sessionId,
      message: 'Sessão criada com sucesso',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
