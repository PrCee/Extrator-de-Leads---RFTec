import { logger } from '../utils/logger';

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

async function testeLeads() {
  try {
    logger.info('🚀 Iniciando teste de leads...');
    
    // Dados de exemplo
    const leads: Lead[] = [
      {
        placeId: 'place_1',
        nome: 'Restaurante Teste',
        endereco: 'Rua Teste, 123',
        telefone: '5511999999999',
        tipoNegocio: 'restaurante',
        avaliacao: 4.5,
        totalAvaliacoes: 100,
        temWhatsapp: true
      }
    ];

    // Exibe os leads
    logger.info('\n📊 Relatório de Leads:');
    logger.info('===================');
    
    leads.forEach((lead, index) => {
      logger.info(`
Lead ${index + 1}:
📍 Nome: ${lead.nome}
📮 Endereço: ${lead.endereco}
📱 Telefone: ${lead.telefone}
🏢 Tipo: ${lead.tipoNegocio}
⭐ Avaliação: ${lead.avaliacao.toFixed(1)} (${lead.totalAvaliacoes} avaliações)
      `);
    });

    logger.info('\n✅ Teste concluído com sucesso!');

  } catch (error) {
    logger.error('❌ Erro ao executar teste:', error);
  }
}

// Executa o teste
testeLeads(); 