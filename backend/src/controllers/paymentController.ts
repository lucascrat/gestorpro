import { Request, Response } from 'express';
import pool from '../config/database';
import { verifyEfiWebhookSignature } from '../services/efiService';
import { renewClientInPanel } from '../services/playwrightService';

export async function handlePixWebhook(req: Request, res: Response) {
  try {
    const { transactionId, status, amount } = req.body;

    console.log(`[Payment] Webhook PIX recebido: ${transactionId}, status: ${status}`);

    // Verificar assinatura do webhook
    const isValid = verifyEfiWebhookSignature(
      JSON.stringify(req.body),
      req.headers['x-signature'] as string,
      process.env.EFI_CLIENT_SECRET || ''
    );

    if (!isValid) {
      console.error('[Payment] Assinatura do webhook inválida');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    if (status === 'confirmed') {
      // Atualizar pagamento no banco
      const paymentResult = await pool.query(
        'UPDATE payments SET status = $1, confirmed_at = NOW() WHERE pix_transaction_id = $2 RETURNING client_id',
        ['confirmed', transactionId]
      );

      if (paymentResult.rows.length === 0) {
        console.error('[Payment] Transação não encontrada:', transactionId);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const clientId = paymentResult.rows[0].client_id;

      // Buscar dados do cliente
      const clientResult = await pool.query(
        'SELECT name, panel_username, panel_password_encrypted FROM clients WHERE id = $1',
        [clientId]
      );

      if (clientResult.rows.length === 0) {
        console.error('[Payment] Cliente não encontrado:', clientId);
        return res.status(404).json({ error: 'Client not found' });
      }

      const client = clientResult.rows[0];

      // Iniciar renovação no painel (sem aguardar, rodar em background)
      renewClientInPanel(
        client.name,
        client.panel_username,
        client.panel_password_encrypted
      ).then((result) => {
        console.log(`[Payment] Renovação completada: ${JSON.stringify(result)}`);

        // Aqui você poderia emitir um evento WebSocket para notificar o cliente
        // io.to(sessionId).emit('renewal-complete', result);
      }).catch((error) => {
        console.error('[Payment] Erro na renovação:', error);
      });

      res.json({
        success: true,
        message: 'Pagamento confirmado, renovação iniciada',
        clientId,
      });
    } else {
      // Atualizar status como falho
      await pool.query(
        'UPDATE payments SET status = $1 WHERE pix_transaction_id = $2',
        [status, transactionId]
      );

      res.json({
        success: false,
        message: 'Pagamento não confirmado',
      });
    }
  } catch (error: any) {
    console.error('[Payment] Erro ao processar webhook:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getPaymentStatus(req: Request, res: Response) {
  try {
    const { transactionId } = req.params;

    const result = await pool.query(
      'SELECT * FROM payments WHERE pix_transaction_id = $1',
      [transactionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
