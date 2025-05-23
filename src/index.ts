import wppconnect from '@wppconnect-team/wppconnect';
import dotenv from 'dotenv';
import { mainDeepSeek } from './service/deepseek';
import { mainGoogle } from './service/google';
import { mainOpenAI } from './service/openai';
import { isNumberWhitelisted, getPersonalizedPrompt } from './config/whitelist';
import { transcreverAudio, processarAudioWhatsApp } from './service/audio';

dotenv.config();

// Verifica se pelo menos uma das chaves está configurada
if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_KEY && !process.env.OPENROUTER_API_KEY) {
  throw Error(
    'Você precisa configurar pelo menos uma das chaves (OPENAI_API_KEY, GEMINI_KEY ou OPENROUTER_API_KEY) no .env!'
  );
}

// Define qual IA usar (prioriza OpenAI se estiver configurado)
const useOpenAI = !!process.env.OPENAI_API_KEY;
const useGemini = !!process.env.GEMINI_KEY && !useOpenAI;

console.log('🚀 Iniciando o bot...');
console.log(`🤖 Usando ${useOpenAI ? 'OpenAI' : useGemini ? 'Gemini' : 'DeepSeek via OpenRouter'} como IA...`);
console.log('📱 Aguarde o QR Code aparecer para conectar com o WhatsApp');

wppconnect
  .create({
    session: 'whatsapp-ai',
    catchQR: (base64Qrimg, asciiQR) => {
      // Limpa o console antes de mostrar o QR code
      console.clear();
      console.log('\n🔍 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:');
      console.log('\n' + asciiQR);
      console.log('\n⚠️ O QR Code expira em 60 segundos!');
    },
    statusFind: (statusSession) => {
      console.log('📱 Status da conexão:', statusSession);
    },
    headless: true,
    autoClose: 0,
    waitForLogin: true,
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list'
    ],
    folderNameToken: 'tokens',
    mkdirFolderToken: './tokens',
    devtools: false
  })
  .then((client) => {
    console.log('✅ Bot conectado com sucesso!');
    start(client);
  })
  .catch((erro) => {
    console.error('❌ Erro ao iniciar o bot:', erro);
  });

async function start(client: wppconnect.Whatsapp): Promise<void> {
  client.onMessage(async (message) => {
    // Ignora mensagens de grupos, status e sistema
    if (
      message.isGroupMsg || 
      message.chatId === 'status@broadcast' ||
      !message.body || // Ignora mensagens sem corpo
      message.type !== 'chat' // Ignora qualquer tipo que não seja chat
    ) {
      console.log('Mensagem ignorada:', {
        isGroup: message.isGroupMsg,
        chatId: message.chatId,
        hasBody: !!message.body,
        type: message.type
      });
      return;
    }

    // Verifica se o número está na lista branca
    console.log('📱 Número recebido:', message.from);
    if (!isNumberWhitelisted(message.from)) {
      console.log(`⚠️ Número ${message.from} não está na lista branca. Mensagem ignorada.`);
      return;
    }
    console.log('✅ Número autorizado na lista branca');

    try {
      console.log(`📩 Mensagem recebida de ${message.from}: ${message.body}`);
      console.log('Configuração atual:', {
        useOpenAI,
        useGemini,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasGeminiKey: !!process.env.GEMINI_KEY,
        hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY
      });
      
      // Obtém o prompt personalizado para o número
      const personalizedPrompt = getPersonalizedPrompt(message.from);
      
      let mensagemProcessada = message.body;

      // Verifica se é uma mensagem de áudio
      if (message.type === 'ptt' || message.type === 'audio') {
        console.log('🎤 Mensagem de áudio detectada');
        try {
          // Processa o áudio
          const audioBuffer = await processarAudioWhatsApp(client, message);
          // Transcreve o áudio
          mensagemProcessada = await transcreverAudio(audioBuffer);
          console.log('🎤 Áudio transcrito:', mensagemProcessada);
        } catch (error) {
          console.error('❌ Erro ao processar áudio:', error);
          await client.sendText(
            message.from,
            'Desculpe, tive um problema ao processar seu áudio. Por favor, tente enviar sua mensagem em texto.'
          );
          return;
        }
      }
      
      // Processa a mensagem com a IA selecionada
      const resposta = useOpenAI
        ? await mainOpenAI({
            currentMessage: mensagemProcessada,
            chatId: message.chatId.toString(),
            prompt: personalizedPrompt
          })
        : useGemini
        ? await mainGoogle({
            currentMessage: mensagemProcessada,
            chatId: message.chatId.toString(),
            prompt: personalizedPrompt
          })
        : await mainDeepSeek({
            currentMessage: mensagemProcessada,
            chatId: message.chatId.toString(),
            prompt: personalizedPrompt
          });

      console.log('🤖 Resposta gerada:', resposta);
      
      // Envia a resposta
      await client.sendText(message.from, resposta);
      console.log('✅ Resposta enviada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      if (error instanceof Error) {
        console.error('Detalhes do erro:', {
          message: error.message,
          stack: error.stack
        });
      }
      await client.sendText(
        message.from,
        'Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente.'
      );
    }
  });
}
