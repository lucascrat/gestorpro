const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface ChatContext {
  history: Array<{ role: string; parts: Array<{ text: string }> }>;
}

const systemPrompt = `Você é um atendente de suporte profissional para um serviço de IPTV/P2P.
Sua responsabilidade é:
1. Responder dúvidas sobre pacotes e serviços
2. Ajudar clientes com renovação de assinaturas
3. Orientar sobre processamento de pagamentos
4. Ser educado, respeitoso e eficiente

Quando o cliente pedir para fazer pagamento ou renovar, mencione que vamos processar via PIX.
Se o cliente perguntar sobre preço, sempre confirme o valor de renovação com eles.`;

export async function generateGeminiResponse(userMessage: string, history: ChatContext['history'] = []): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const messages = [
      ...history,
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ];

    const chat = model.startChat({
      history: messages.slice(0, -1)
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error('Erro ao chamar Gemini:', error);
    throw new Error('Falha ao gerar resposta da IA');
  }
}

export function detectPaymentRequest(message: string): boolean {
  const paymentKeywords = ['pagar', 'pagamento', 'renovar', 'recarregar', 'pix', 'boleto', 'cartão'];
  const lowerMessage = message.toLowerCase();
  return paymentKeywords.some(keyword => lowerMessage.includes(keyword));
}
