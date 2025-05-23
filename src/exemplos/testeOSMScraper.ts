import { MapsScraper } from '../service/mapsScraper';
import { logger } from '../utils/logger';

async function testarOSMScraper() {
  try {
    logger.info('🚀 Iniciando teste do OSM Scraper');
    
    const scraper = MapsScraper.getInstance();
    
    // Teste com diferentes tipos de estabelecimentos
    const queries = [
      'Restaurantes São Paulo',
      'Barbearias Guarulhos',
      'Dentistas Campinas',
      'Academias Santos'
    ];
    
    for (const query of queries) {
      logger.info(`\n🔍 Testando busca por: ${query}`);
      
      const leads = await scraper.buscarEstabelecimentos(query, 5);
      
      logger.info(`\n📊 Resultados para ${query}:`);
      leads.forEach((lead, index) => {
        logger.info(`\n${index + 1}. ${lead.nome}`);
        logger.info(`   📍 ${lead.endereco}`);
        logger.info(`   📞 ${lead.telefone}`);
        logger.info(`   🏷️ ${lead.tipoNegocio}`);
      });
      
      // Aguarda um pouco entre as buscas
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    logger.info('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    logger.error('❌ Erro durante o teste:', error);
  }
}

// Executa o teste
testarOSMScraper(); 