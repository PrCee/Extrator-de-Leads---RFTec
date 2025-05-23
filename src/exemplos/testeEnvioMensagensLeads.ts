import { LeadManager } from '../service/leadManager';
import { create } from '@wppconnect-team/wppconnect';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

dotenv.config();

async function main() {
  try {
    // Inicializa o cliente WhatsApp
    const client = await create({
      session: 'lead-manager',
      catchQR: (base64Qr, asciiQR) => {
        logger.info('QR Code gerado:', asciiQR);
      },
      statusFind: (statusSession) => {
        logger.info('Status da sessão:', statusSession);
      },
    });

    // Configuração do LeadManager
    const config = {
      useOpenAI: true,
      useGemini: false,
      maxLeadsPorBusca: 20,
      delayEntreMensagens: 5000, // 5 segundos
    };

    // Inicializa o LeadManager
    const leadManager = LeadManager.getInstance(config);

    // Número de WhatsApp autorizado (deve estar na lista branca)
    const numeroWhatsApp = process.env.WHATSAPP_NUMBER || '';

    // Lê os leads do arquivo JSON mais recente de restaurantes
    const diretorioResultados = path.join(os.homedir(), 'Desktop', 'Teste extração leads');
    const arquivos = await fs.readdir(diretorioResultados);
    const arquivoJson = arquivos
      .filter(f => f.endsWith('.json') && f.includes('restaurantes'))
      .sort()
      .reverse()[0];

    if (!arquivoJson) {
      throw new Error('Nenhum arquivo de leads encontrado');
    }

    const leads = JSON.parse(
      await fs.readFile(path.join(diretorioResultados, arquivoJson), 'utf-8')
    );

    logger.info(`📝 Carregados ${leads.length} leads do arquivo ${arquivoJson}`);

    // Processa os leads
    await leadManager.processarLeads(leads, numeroWhatsApp, client);

    logger.info('✅ Processo de envio de mensagens concluído com sucesso!');

  } catch (error) {
    logger.error('❌ Erro durante o processo:', error);
  }
}

// Executa o teste
main(); 