interface PIXQRCodeResponse {
  qrCode: string;
  transactionId: string;
}

interface PIXConfirmation {
  status: 'confirmed' | 'pending' | 'failed';
  transactionId: string;
  amount: number;
}

export async function generatePixQRCode(clientId: number, amount: number): Promise<PIXQRCodeResponse> {
  try {
    console.log(`[EFI] Gerando QR Code PIX para cliente ${clientId}, valor: R$ ${amount}`);

    // Aqui você chamaria a API real da EFI
    // Por enquanto, retornando mock para desenvolvimento
    const mockQRCode = `00020126580014br.gov.bcb.pix0136${clientId}-${amount}520400005303986540${amount}5802BR5913SUPORTE6009SAO PAULO62410503***63041D3D`;
    const mockTransactionId = `EFI_${Date.now()}_${clientId}`;

    return {
      qrCode: mockQRCode,
      transactionId: mockTransactionId,
    };
  } catch (error) {
    console.error('[EFI] Erro ao gerar QR Code:', error);
    throw new Error('Falha ao gerar PIX');
  }
}

export async function verifyPixPayment(transactionId: string): Promise<PIXConfirmation> {
  try {
    console.log(`[EFI] Verificando pagamento: ${transactionId}`);

    // Aqui você chamaria a API real da EFI para verificar o status
    // Por enquanto, retornando mock
    return {
      status: 'pending',
      transactionId,
      amount: 0,
    };
  } catch (error) {
    console.error('[EFI] Erro ao verificar PIX:', error);
    throw new Error('Falha ao verificar pagamento');
  }
}

export function verifyEfiWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // Implementar verificação de assinatura HMAC-SHA256 com chave da EFI
  console.log('[EFI] Verificando assinatura do webhook');
  return true; // Mock para desenvolvimento
}
