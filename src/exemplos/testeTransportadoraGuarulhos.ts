import { PromptManager } from '../service/promptManager';
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
    const nomeArquivo = `${nicho.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;

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

async function testeTransportadoraGuarulhos() {
  try {
    // Obtém instância do gerenciador de prompts
    const promptManager = PromptManager.getInstance();
    
    // Obtém instância do extrator de leads
    const extrator = MapsScraper.getInstance();

    // Configuração para uma transportadora
    const configTransportadora = {
      nicho: 'transportadora' as const,
      nomeEmpresa: 'Transportadora Express Guarulhos',
      produtos: [
        'Sistema de Gestão de Frota',
        'Controle de Operações',
        'Gestão Financeira',
        'Rastreamento em Tempo Real'
      ],
      diferenciais: [
        'Automatização de processos',
        'Redução de custos operacionais',
        'Controle total da operação',
        'Gestão simplificada'
      ],
      precos: [
        'Plano Básico: R$ 297/mês',
        'Plano Profissional: R$ 497/mês',
        'Plano Enterprise: Sob consulta',
        'Implementação: Grátis'
      ]
    };

    // Gera prompt para a transportadora
    const promptTransportadora = promptManager.gerarPromptVendedor(configTransportadora);
    logger.info('✅ Prompt gerado para transportadora');
    
    // Verifica se as regras fixas estão presentes
    const regrasFixas = [
      'Use SEMPRE abreviações comuns',
      'Mantenha mensagens CURTAS e objetivas',
      'NUNCA use linguagem formal ou corporativa',
      'NUNCA faça textos longos ou explicativos',
      'NUNCA pareça um vendedor de telemarketing'
    ];

    logger.info('🔍 Verificando regras fixas no prompt:');
    regrasFixas.forEach(regra => {
      const presente = promptTransportadora.includes(regra);
      logger.info(`${presente ? '✅' : '❌'} ${regra}`);
    });

    // Busca transportadoras em Guarulhos
    logger.info('🔍 Buscando transportadoras em Guarulhos...');
    const leads = await extrator.buscarEstabelecimentosGoogle(
      'Transportadoras Guarulhos',
      20 // Limite de 20 resultados para teste
    );
    
    logger.info(`✅ Encontradas ${leads.length} transportadoras em Guarulhos`);
    
    // Salva os leads encontrados
    await salvarLeads(leads, 'Transportadoras Guarulhos');
    
    // Exibe os leads encontrados
    logger.info('\n📊 Relatório de Leads para Transportadoras em Guarulhos:');
    logger.info('===================');
    
    if (leads.length === 0) {
      logger.info('Nenhum lead encontrado para Transportadoras em Guarulhos');
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
      logger.info(`📈 Estatísticas para Transportadoras em Guarulhos:`);
      logger.info(`- Total de leads encontrados: ${leads.length}`);
      logger.info(`- Média de avaliação: ${(leads.reduce((acc, lead) => acc + lead.avaliacao, 0) / leads.length).toFixed(1)}`);
      logger.info(`- Total de avaliações: ${leads.reduce((acc, lead) => acc + lead.totalAvaliacoes, 0)}`);
    }

    logger.info('\n✅ Teste de extração de leads para Transportadoras em Guarulhos concluído com sucesso!');

  } catch (error) {
    logger.error('❌ Erro ao executar teste:', error);
  }
}

// Executa o teste
testeTransportadoraGuarulhos(); 