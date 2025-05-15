import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import { PromptManager } from './promptManager';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const mainDeepSeek = async ({
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
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: 'deepseek/deepseek-chat:free',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: currentMessage,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/rftecnologia',
          'X-Title': 'RFtecnologia WhatsApp Assistant',
        },
      }
    );

    console.log('🤖 Resposta do DeepSeek:', response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Erro ao processar mensagem com DeepSeek:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('❌ Erro ao processar mensagem com DeepSeek:', error);
    }
    throw error;
  }
};