import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { PromptManager } from './promptManager';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const mainGoogle = async ({
  currentMessage,
  chatId,
  promptConfig
}: {
  currentMessage: string;
  chatId: string;
  promptConfig: any;
}): Promise<string> => {
  try {
    const promptManager = PromptManager.getInstance();
    const prompt = promptManager.gerarPromptSophia(promptConfig);
    // Inicia uma nova conversa com o prompt configurado
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: prompt,
        },
        {
          role: 'model',
          parts: 'Entendi! Vou ajudar você da melhor forma possível.',
        },
      ],
    });

    // Envia a mensagem do usuário
    const result = await chat.sendMessage(currentMessage);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 Resposta do Gemini:', text);
    return text;
  } catch (error) {
    console.error('❌ Erro ao processar mensagem com Gemini:', error);
    if (error instanceof Error) {
      console.error('Detalhes do erro:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};
