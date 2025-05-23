import { GoogleMapsExtractor } from '../service/googleMapsExtractor';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

async function testeGoogleMapsExtractor() {
  try {
    // Inicializa o extrator do Google Maps
    const extrator = await GoogleMapsExtractor.getInstance();

    // Lista de nichos para testar
    const nichos = [
      { termo: 'Restaurantes São Paulo', descricao: 'Restaurantes' },
      { termo: 'Barbearias São Paulo', descricao: 'Barbearias' },
      { termo: 'Dentistas São Paulo', descricao: 'Dentistas' },
      { termo: 'Academias São Paulo', descricao: 'Academias' }
    ];

    // Testa cada nicho
    for (const nicho of nichos) {
      logger.info(`\n🚀 Testando extração de leads do Google Maps para: ${nicho.descricao}`);
      logger.info(`🔍 Termo de busca: ${nicho.termo}`);
      
      // Busca estabelecimentos (limitado a 10 para teste)
      const leads = await extrator.buscarEstabelecimentos(
        nicho.termo,
        10 // Limitado a 10 resultados para teste
      );

      // Exibe os leads encontrados
      logger.info(`\n📊 Relatório de Leads para ${nicho.descricao}:`);
      logger.info('===================');
      
      if (leads.length === 0) {
        logger.info(`Nenhum lead encontrado para ${nicho.descricao}`);
      } else {
        leads.forEach((lead, index) => {
          logger.info(`
Lead ${index + 1}:
📍 Nome: ${lead.nome}
📮 Endereço: ${lead.endereco}
📱 Telefone: ${lead.telefone}
🏢 Tipo: ${lead.tipoNegocio}
⭐ Avaliação: ${lead.avaliacao.toFixed(1)} (${lead.totalAvaliacoes} avaliações)
📅 Data de Coleta: ${new Date(lead.dataColeta).toLocaleString()}
          `);
        });

        logger.info('===================');
        logger.info(`📈 Estatísticas para ${nicho.descricao}:`);
        logger.info(`- Total de leads encontrados: ${leads.length}`);
        logger.info(`- Média de avaliação: ${(leads.reduce((acc, lead) => acc + lead.avaliacao, 0) / leads.length).toFixed(1)}`);
        logger.info(`- Total de avaliações: ${leads.reduce((acc, lead) => acc + lead.totalAvaliacoes, 0)}`);
      }
      
      // Aguarda um pouco entre as buscas
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    logger.info('\n✅ Teste de extração de leads do Google Maps concluído com sucesso!');

  } catch (error) {
    logger.error('❌ Erro ao executar teste de extração de leads do Google Maps:', error);
  }
}

// Executa o teste
testeGoogleMapsExtractor(); 