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

class ExtratorLeadsSimulado {
  private static instance: ExtratorLeadsSimulado;

  private constructor() {}

  public static getInstance(): ExtratorLeadsSimulado {
    if (!ExtratorLeadsSimulado.instance) {
      ExtratorLeadsSimulado.instance = new ExtratorLeadsSimulado();
    }
    return ExtratorLeadsSimulado.instance;
  }

  /**
   * Busca estabelecimentos simulados
   * @param query Termo de busca (ex: "Dentistas Guarulhos")
   * @param maxResults Número máximo de resultados (padrão: 50)
   * @returns Lista de leads encontrados
   */
  public async buscarEstabelecimentos(
    query: string,
    maxResults: number = 50
  ): Promise<Lead[]> {
    try {
      logger.info(`🔍 Buscando estabelecimentos simulados para: ${query}`);
      
      // Determina o tipo de negócio com base na query
      const tipoNegocio = this.determinarTipoNegocio(query);
      
      // Gera leads simulados
      const leads: Lead[] = [];
      const numLeads = Math.min(maxResults, 20); // Limita a 20 leads para teste
      
      for (let i = 0; i < numLeads; i++) {
        const lead = this.gerarLeadSimulado(tipoNegocio, i);
        leads.push(lead);
      }
      
      logger.info(`✅ Encontrados ${leads.length} leads simulados`);
      return leads;
    } catch (error) {
      logger.error('Erro ao buscar estabelecimentos simulados:', error);
      throw error;
    }
  }

  /**
   * Determina o tipo de negócio com base na query
   */
  private determinarTipoNegocio(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('restaurante')) return 'restaurante';
    if (queryLower.includes('barbearia')) return 'barbearia';
    if (queryLower.includes('dentista')) return 'dentista';
    if (queryLower.includes('academia')) return 'academia';
    
    return 'estabelecimento';
  }

  /**
   * Gera um lead simulado
   */
  private gerarLeadSimulado(tipoNegocio: string, index: number): Lead {
    const nomes = {
      restaurante: [
        'Restaurante Sabor & Arte',
        'Cantina Italiana',
        'Churrascaria Boi Gordo',
        'Pizzaria Forno a Lenha',
        'Hamburgueria Artesanal'
      ],
      barbearia: [
        'Barbearia Vintage',
        'Corte & Estilo',
        'Barber Shop Premium',
        'Barbearia do Zé',
        'Estilo & Tradição'
      ],
      dentista: [
        'Clínica Sorriso Perfeito',
        'Dental Care',
        'Odonto Saúde',
        'Clínica Dentária Moderna',
        'Sorriso & Saúde'
      ],
      academia: [
        'Academia Power Gym',
        'Fitness Center',
        'Academia Corpo & Saúde',
        'Gym & Fitness',
        'Academia Energia Total'
      ]
    };

    const enderecos = [
      'Rua das Flores, 123 - São Paulo, SP',
      'Av. Paulista, 1000 - São Paulo, SP',
      'Rua Augusta, 500 - São Paulo, SP',
      'Av. Brigadeiro Faria Lima, 2000 - São Paulo, SP',
      'Rua Oscar Freire, 800 - São Paulo, SP'
    ];

    const telefones = [
      '5511999999999',
      '5511988888888',
      '5511977777777',
      '5511966666666',
      '5511955555555'
    ];

    const nomesArray = nomes[tipoNegocio as keyof typeof nomes] || nomes.restaurante;
    const nome = nomesArray[index % nomesArray.length];
    const endereco = enderecos[index % enderecos.length];
    const telefone = telefones[index % telefones.length];
    
    return {
      placeId: `place_${tipoNegocio}_${index}`,
      nome,
      endereco,
      telefone,
      tipoNegocio,
      avaliacao: 3.5 + Math.random() * 1.5, // Entre 3.5 e 5.0
      totalAvaliacoes: Math.floor(10 + Math.random() * 990), // Entre 10 e 1000
      temWhatsapp: true
    };
  }
}

async function testeExtratorLeadsSimulado() {
  try {
    // Inicializa o extrator simulado
    const extrator = ExtratorLeadsSimulado.getInstance();

    // Lista de nichos para testar
    const nichos = [
      { termo: 'Restaurantes São Paulo', descricao: 'Restaurantes' },
      { termo: 'Barbearias São Paulo', descricao: 'Barbearias' },
      { termo: 'Dentistas São Paulo', descricao: 'Dentistas' },
      { termo: 'Academias São Paulo', descricao: 'Academias' }
    ];

    // Testa cada nicho
    for (const nicho of nichos) {
      logger.info(`\n🚀 Testando extração de leads simulados para: ${nicho.descricao}`);
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
          `);
        });

        logger.info('===================');
        logger.info(`📈 Estatísticas para ${nicho.descricao}:`);
        logger.info(`- Total de leads encontrados: ${leads.length}`);
        logger.info(`- Média de avaliação: ${(leads.reduce((acc, lead) => acc + lead.avaliacao, 0) / leads.length).toFixed(1)}`);
        logger.info(`- Total de avaliações: ${leads.reduce((acc, lead) => acc + lead.totalAvaliacoes, 0)}`);
      }
      
      // Aguarda um pouco entre as buscas
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info('\n✅ Teste de extração de leads simulados concluído com sucesso!');

  } catch (error) {
    logger.error('❌ Erro ao executar teste de extração de leads simulados:', error);
  }
}

// Executa o teste
testeExtratorLeadsSimulado(); 