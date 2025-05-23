import { GoogleMapsExtractor } from '../service/googleMapsExtractor';
import { logger } from '../utils/logger';

async function exemploUsoExtratorLeads() {
  try {
    // Inicializa o extrator
    const extrator = GoogleMapsExtractor.getInstance();

    // Busca estabelecimentos (agora com 50 resultados)
    logger.info('🚀 Iniciando extração de leads...');
    const leads = await extrator.buscarEstabelecimentos(
      'Dentistas Guarulhos',
      50 // Aumentado para 50 resultados
    );

    // Exibe os leads encontrados
    logger.info('\n📊 Relatório de Leads:');
    logger.info('===================');
    
    leads.forEach((lead, index) => {
      logger.info(`
Lead ${index + 1}:
📍 Nome: ${lead.nome}
📮 Endereço: ${lead.endereco}
📱 Telefone: ${lead.telefone}
🏢 Tipo: ${lead.tipoNegocio}
⭐ Avaliação: ${lead.avaliacao} (${lead.totalAvaliacoes} avaliações)
      `);
    });

    logger.info('===================');
    logger.info(`📈 Estatísticas:`);
    logger.info(`- Total de leads encontrados: ${leads.length}`);
    logger.info(`- Média de avaliação: ${(leads.reduce((acc, lead) => acc + lead.avaliacao, 0) / leads.length).toFixed(1)}`);
    logger.info(`- Total de avaliações: ${leads.reduce((acc, lead) => acc + lead.totalAvaliacoes, 0)}`);

  } catch (error) {
    logger.error('❌ Erro ao executar exemplo:', error);
  }
}

// Executa o exemplo
exemploUsoExtratorLeads(); 