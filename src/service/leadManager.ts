import { MapsScraper } from './mapsScraper';
import { mainOpenAI } from './openai';
import { mainGoogle } from './google';
import { mainDeepSeek } from './deepseek';
import { logger } from '../utils/logger';
import { isNumberWhitelisted, getPersonalizedPrompt } from '../config/whitelist';

interface Lead {
  placeId: string;
  nome: string;
  endereco: string;
  telefone: string;
  tipoNegocio: string;
  avaliacao: number;
  totalAvaliacoes: number;
  temWhatsapp: boolean;
}

interface LeadManagerConfig {
  useOpenAI: boolean;
  useGemini: boolean;
  maxLeadsPorBusca: number;
  delayEntreMensagens: number;
}

export class LeadManager {
  private static instance: LeadManager;
  private mapsScraper: MapsScraper;
  private config: LeadManagerConfig;

  private constructor(config: LeadManagerConfig) {
    this.mapsScraper = MapsScraper.getInstance();
    this.config = config;
  }

  public static getInstance(config: LeadManagerConfig): LeadManager {
    if (!LeadManager.instance) {
      LeadManager.instance = new LeadManager(config);
    }
    return LeadManager.instance;
  }

  /**
   * Gera uma mensagem personalizada para um lead usando IA
   */
  private async gerarMensagemPersonalizada(lead: Lead, promptConfig: any): Promise<string> {
    try {
      logger.info(`🔍 Gerando mensagem para ${lead.nome}...`);
      
      const contexto = `
Lead: ${lead.nome}
Tipo de Negócio: ${lead.tipoNegocio}
Endereço: ${lead.endereco}
Avaliação: ${lead.avaliacao}/5 (${lead.totalAvaliacoes} avaliações)
`;

      logger.info('📝 Contexto da mensagem:', contexto);
      logger.info('🤖 Usando OpenAI para gerar mensagem...');

      const mensagem = this.config.useOpenAI
        ? await mainOpenAI({
            currentMessage: contexto,
            chatId: lead.placeId,
            promptConfig: promptConfig
          })
        : this.config.useGemini
        ? await mainGoogle({
            currentMessage: contexto,
            chatId: lead.placeId,
            promptConfig: promptConfig
          })
        : await mainDeepSeek({
            currentMessage: contexto,
            chatId: lead.placeId,
            promptConfig: promptConfig
          });

      logger.info('✅ Mensagem gerada:', mensagem);
      return mensagem;
    } catch (error) {
      logger.error('❌ Erro ao gerar mensagem personalizada:', error);
      throw error;
    }
  }

  /**
   * Formata o número de telefone para o formato do WhatsApp
   */
  private formatarNumeroWhatsApp(telefone: string): string {
    // Remove caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Adiciona o código do país se não tiver
    if (numeroLimpo.length <= 11) {
      return `55${numeroLimpo}@c.us`;
    }
    
    return `${numeroLimpo}@c.us`;
  }

  /**
   * Processa uma lista de leads e envia mensagens personalizadas
   */
  public async processarLeads(
    leads: Lead[],
    numeroWhatsApp: string,
    client: any
  ): Promise<void> {
    try {
      logger.info(`🔍 Verificando número ${numeroWhatsApp} na whitelist...`);
      
      // Verifica se o número está na lista branca
      if (!isNumberWhitelisted(numeroWhatsApp)) {
        logger.error(`❌ Número ${numeroWhatsApp} não está na lista branca`);
        return;
      }

      logger.info('✅ Número verificado na whitelist');
      logger.info('📝 Obtendo prompt personalizado...');

      // Obtém o prompt personalizado
      const prompt = getPersonalizedPrompt(numeroWhatsApp);
      logger.info('✅ Prompt obtido:', prompt);

      for (const lead of leads) {
        try {
          logger.info(`🔄 Processando lead: ${lead.nome}`);
          
          // Gera mensagem personalizada
          const promptConfig = {
            nicho: 'restaurante',
            nomeEmpresa: lead.nome,
            produtos: ['Pratos', 'Bebidas'],
            diferenciais: ['Atendimento personalizado', 'Ambiente acolhedor'],
            precos: ['R$ 30 a R$ 100']
          };
          const mensagem = await this.gerarMensagemPersonalizada(lead, promptConfig);
          
          // Formata o número de telefone
          const numeroFormatado = this.formatarNumeroWhatsApp(lead.telefone);
          logger.info(`📤 Enviando mensagem para ${numeroFormatado}...`);
          
          // Envia mensagem via WhatsApp
          await client.sendText(numeroFormatado, mensagem);
          logger.info(`✅ Mensagem enviada para ${lead.nome} (${numeroFormatado})`);

          logger.info(`⏳ Aguardando ${this.config.delayEntreMensagens}ms antes da próxima mensagem...`);
          
          // Aguarda um tempo antes de enviar a próxima mensagem
          await new Promise(resolve => 
            setTimeout(resolve, this.config.delayEntreMensagens)
          );

        } catch (error) {
          logger.error(`❌ Erro ao processar lead ${lead.nome}:`, error);
          continue;
        }
      }

      logger.info('✅ Processamento de leads concluído');
    } catch (error) {
      logger.error('❌ Erro ao processar leads:', error);
      throw error;
    }
  }

  /**
   * Busca e processa leads para um tipo de negócio e cidade
   */
  public async buscarEProcessarLeads(
    query: string,
    numeroWhatsApp: string,
    client: any
  ): Promise<void> {
    try {
      logger.info(`🔍 Iniciando busca e processamento de leads para: ${query}`);

      // Busca leads usando OpenStreetMap
      const leads = await this.mapsScraper.buscarEstabelecimentos(
        query,
        this.config.maxLeadsPorBusca
      );

      logger.info(`✅ Total de leads encontrados: ${leads.length}`);

      // Processa os leads
      await this.processarLeads(leads, numeroWhatsApp, client);

    } catch (error) {
      logger.error('❌ Erro ao buscar e processar leads:', error);
      throw error;
    }
  }
} 