import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createWriteStream, createReadStream } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import * as uuid from 'uuid';
import { unlink } from 'fs/promises';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pipelineAsync = promisify(pipeline);

export async function transcreverAudio(audioBuffer: Buffer): Promise<string> {
  let tempFilePath = '';
  try {
    console.log('🎤 Iniciando transcrição de áudio...');
    
    // Cria um arquivo temporário para o áudio
    tempFilePath = join(__dirname, `temp_${uuid.v4()}.mp3`);
    const writeStream = createWriteStream(tempFilePath);
    
    // Salva o buffer em um arquivo temporário
    await pipelineAsync(
      Buffer.from(audioBuffer),
      writeStream
    );
    
    // Cria um arquivo para a API da OpenAI
    const file = await openai.files.create({
      file: createReadStream(tempFilePath),
      purpose: 'assistants'
    });
    
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(tempFilePath),
      model: "whisper-1",
      language: "pt",
      response_format: "text"
    });
    
    console.log('✅ Áudio transcrito com sucesso:', transcription);
    return transcription.text || transcription.toString();
  } catch (error) {
    console.error('❌ Erro ao transcrever áudio:', error);
    throw error;
  } finally {
    // Limpa o arquivo temporário
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (error) {
        console.error('❌ Erro ao deletar arquivo temporário:', error);
      }
    }
  }
}

// Função auxiliar para converter o arquivo de áudio do WhatsApp
export async function processarAudioWhatsApp(client: any, message: any): Promise<Buffer> {
  try {
    console.log('📥 Baixando áudio do WhatsApp...');
    
    // Verifica o tipo de áudio
    if (!message.type || (message.type !== 'ptt' && message.type !== 'audio')) {
      throw new Error('Tipo de áudio não suportado');
    }
    
    // Verifica se há mídia
    if (!message.mediaUrl) {
      throw new Error('URL da mídia não encontrada');
    }
    
    // Baixa o arquivo de áudio
    const mediaData = await client.decryptFile(message);
    
    // Verifica o tamanho do arquivo (limite de 25MB da API da OpenAI)
    if (mediaData.length > 25 * 1024 * 1024) {
      throw new Error('Arquivo de áudio muito grande (máximo 25MB)');
    }
    
    console.log('✅ Áudio baixado com sucesso');
    return mediaData;
  } catch (error) {
    console.error('❌ Erro ao baixar áudio:', error);
    throw error;
  }
} 