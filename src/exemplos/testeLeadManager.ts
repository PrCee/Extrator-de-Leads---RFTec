import { LeadManager } from '../service/leadManager';
import { create } from '@wppconnect-team/wppconnect';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

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
      maxLeadsPorBusca: 10,
      delayEntreMensagens: 5000, // 5 segundos
    };

    // Inicializa o LeadManager
    const leadManager = LeadManager.getInstance(config);

    // Número de WhatsApp autorizado (deve estar na lista branca)
    const numeroWhatsApp = process.env.WHATSAPP_NUMBER || '';

    // Busca e processa leads para restaurantes em São Paulo
    await leadManager.buscarEProcessarLeads(
      'Restaurantes São Paulo',
      numeroWhatsApp,
      client
    );

    logger.info('✅ Processo concluído com sucesso!');

  } catch (error) {
    logger.error('❌ Erro durante o processo:', error);
  }
}

main(); 