import axios from 'axios';
import dotenv from 'dotenv';
import { PromptManager } from './promptManager';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export const mainOpenAI = async ({
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
    console.log('🔑 Usando chave OpenAI:', OPENAI_API_KEY?.slice(0, 10) + '...');
    console.log('📝 Enviando requisição para OpenAI...');
    console.log('💬 Mensagem:', currentMessage);
    console.log('🤖 Prompt:', prompt);

    const response = await axios.post(
      OPENAI_URL,
      {
        model: 'gpt-3.5-turbo',
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
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Resposta recebida do OpenAI');
    console.log('🤖 Conteúdo da resposta:', response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Erro ao processar mensagem com OpenAI:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('❌ Erro ao processar mensagem com OpenAI:', error);
    }
    throw error;
  }
};
