import { MapsScraper } from '../service/mapsScraper';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import { stringify } from 'csv-stringify/sync';
import os from 'os';

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

async function salvarLeads(leads: Lead[], nicho: string) {
  try {
    // Define o diretório como a pasta "Teste extração leads" na área de trabalho
    const diretorioResultados = path.join(os.homedir(), 'Desktop', 'Teste extração leads');
    await fs.mkdir(diretorioResultados, { recursive: true });

    // Nome do arquivo baseado no nicho e data/hora
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const nomeArquivo = `${nicho.toLowerCase().replace(/\s+/g, '_')}_google_${timestamp}`;

    // Salva em JSON
    const arquivoJson = path.join(diretorioResultados, `${nomeArquivo}.json`);
    await fs.writeFile(
      arquivoJson,
      JSON.stringify(leads, null, 2),
      'utf-8'
    );
    logger.info(`📝 Leads salvos em JSON: ${arquivoJson}`);

    // Salva em CSV
    const arquivoCsv = path.join(diretorioResultados, `${nomeArquivo}.csv`);
    const csv = stringify(leads, {
      header: true,
      columns: {
        placeId: 'ID',
        nome: 'Nome',
        endereco: 'Endereço',
        telefone: 'Telefone',
        tipoNegocio: 'Tipo de Negócio',
        avaliacao: 'Avaliação',
        totalAvaliacoes: 'Total de Avaliações',
        temWhatsapp: 'Tem WhatsApp'
      }
    });
    await fs.writeFile(arquivoCsv, csv, 'utf-8');
    logger.info(`📝 Leads salvos em CSV: ${arquivoCsv}`);

  } catch (error) {
    logger.error('Erro ao salvar leads:', error);
  }
}

async function testeGoogleMapsScraper() {
  try {
    // Inicializa o extrator
    const extrator = MapsScraper.getInstance();

    // Testa apenas o nicho de Restaurantes
    const nicho = { termo: 'Restaurantes São Paulo', descricao: 'Restaurantes' };
    
    logger.info(`\n🚀 Testando extração de leads do Google Maps para: ${nicho.descricao}`);
    logger.info(`🔍 Termo de busca: ${nicho.termo}`);
    logger.info('⏳ Iniciando processo de extração...');
    
    // Busca estabelecimentos (10 leads para teste)
    const leads = await extrator.buscarEstabelecimentos(
      nicho.termo,
      10 // 10 resultados para teste
    );

    logger.info('✅ Processo de extração concluído');

    // Salva os leads em arquivos
    await salvarLeads(leads, nicho.descricao);

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
        `);
      });

      logger.info('===================');
      logger.info(`📈 Estatísticas para ${nicho.descricao}:`);
      logger.info(`- Total de leads encontrados: ${leads.length}`);
      logger.info(`- Média de avaliação: ${(leads.reduce((acc, lead) => acc + lead.avaliacao, 0) / leads.length).toFixed(1)}`);
      logger.info(`- Total de avaliações: ${leads.reduce((acc, lead) => acc + lead.totalAvaliacoes, 0)}`);
    }

    logger.info('\n✅ Teste de extração de leads do Google Maps concluído com sucesso!');

  } catch (error) {
    logger.error('❌ Erro ao executar teste de extração de leads do Google Maps:', error);
  }
}

// Executa o teste
testeGoogleMapsScraper(); 