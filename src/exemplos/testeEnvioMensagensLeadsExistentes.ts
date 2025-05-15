import { create } from '@wppconnect-team/wppconnect';
import { LeadManager } from '../service/leadManager';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

// Configuração do LeadManager
const config = {
  useOpenAI: true, // Define se deve usar OpenAI
  useGemini: false, // Define se deve usar Gemini
  maxLeadsPorBusca: 10,
  delayEntreMensagens: 5000 // 5 segundos entre mensagens
};

async function initializeWhatsApp() {
  try {
    const client = await create({
      session: 'teste-envio-leads',
      catchQR: (base64Qr) => {
        logger.info('QR Code gerado, escaneie para continuar');
      },
      logQR: false
    });

    return client;
  } catch (error) {
    logger.error('❌ Erro ao inicializar WhatsApp:', error);
    throw error;
  }
}

async function carregarLeadsMaisRecentes(): Promise<any[]> {
  try {
    const diretorioLeads = path.join(__dirname, '..', '..', 'leads');
    logger.info(`📂 Buscando arquivos de leads em: ${diretorioLeads}`);

    // Verifica se o diretório existe
    if (!fs.existsSync(diretorioLeads)) {
      throw new Error(`Diretório de leads não encontrado: ${diretorioLeads}`);
    }

    // Lista todos os arquivos .json no diretório
    const arquivos = fs.readdirSync(diretorioLeads)
      .filter(arquivo => arquivo.endsWith('.json'))
      .map(arquivo => ({
        nome: arquivo,
        caminho: path.join(diretorioLeads, arquivo),
        data: fs.statSync(path.join(diretorioLeads, arquivo)).mtime
      }))
      .sort((a, b) => b.data.getTime() - a.data.getTime());

    if (arquivos.length === 0) {
      throw new Error('Nenhum arquivo de leads encontrado');
    }

    logger.info(`📄 Carregando arquivo mais recente: ${arquivos[0].nome}`);
    const leads = JSON.parse(fs.readFileSync(arquivos[0].caminho, 'utf-8'));
    logger.info(`✅ ${leads.length} leads carregados`);

    return leads;
  } catch (error) {
    logger.error('❌ Erro ao carregar leads:', error);
    throw error;
  }
}

async function main() {
  try {
    logger.info('🚀 Iniciando teste de envio de mensagens para leads existentes...');

    // Inicializa o WhatsApp
    const client = await initializeWhatsApp();
    logger.info('✅ WhatsApp inicializado');

    // Carrega os leads mais recentes
    const leads = await carregarLeadsMaisRecentes();

    // Inicializa o LeadManager com a configuração
    const leadManager = LeadManager.getInstance(config);
    logger.info('✅ LeadManager inicializado');

    // Número do WhatsApp que está na whitelist
    const numeroWhatsApp = '5511999594152';

    // Processa os leads
    await leadManager.processarLeads(leads, numeroWhatsApp, client);
    logger.info('✅ Processamento de leads concluído');

  } catch (error) {
    logger.error('❌ Erro durante a execução:', error);
  }
}

main(); 