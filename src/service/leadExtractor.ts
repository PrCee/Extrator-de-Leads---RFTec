import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import { stringify } from 'csv-stringify/sync';

interface Lead {
  nome: string;
  telefone: string;
  temWhatsapp: boolean;
  endereco?: string;
  site?: string;
}

interface NichoConfig {
  nome: string;
  termos: string[];
  areas: string[];
}

export class LeadExtractor {
  private static instance: LeadExtractor;
  private leadsProcessados: Set<string> = new Set();
  private limiteDiario: number = 30;

  private nichos: NichoConfig[] = [
    {
      nome: 'Advocacia',
      termos: ['escritório de advocacia', 'advogado', 'escritório jurídico'],
      areas: ['São Paulo', 'Guarulhos', 'Osasco']
    },
    {
      nome: 'Clínicas',
      termos: ['clínica médica', 'consultório médico', 'clínica de saúde'],
      areas: ['São Paulo', 'Guarulhos', 'Osasco']
    },
    {
      nome: 'Educação',
      termos: ['escola', 'curso', 'faculdade', 'instituição de ensino'],
      areas: ['São Paulo', 'Guarulhos', 'Osasco']
    },
    {
      nome: 'Imobiliárias',
      termos: ['imobiliária', 'corretor de imóveis', 'imóveis'],
      areas: ['São Paulo', 'Guarulhos', 'Osasco']
    },
    {
      nome: 'Contabilidade',
      termos: ['escritório de contabilidade', 'contador', 'contabilidade'],
      areas: ['São Paulo', 'Guarulhos', 'Osasco']
    }
  ];

  private constructor() {}

  public static getInstance(): LeadExtractor {
    if (!LeadExtractor.instance) {
      LeadExtractor.instance = new LeadExtractor();
    }
    return LeadExtractor.instance;
  }

  /**
   * Extrai leads de um nicho específico
   */
  public async extrairLeadsPorNicho(nichoNome: string): Promise<string[]> {
    try {
      const nicho = this.nichos.find(n => n.nome === nichoNome);
      if (!nicho) {
        throw new Error(`Nicho ${nichoNome} não encontrado`);
      }

      const arquivosCsv: string[] = [];

      for (const area of nicho.areas) {
        for (const termo of nicho.termos) {
          const query = `${termo} em ${area}`;
          logger.info(`🔍 Buscando: ${query}`);
          
          const arquivoCsv = await this.extrairLeads(area, query);
          if (arquivoCsv) {
            arquivosCsv.push(arquivoCsv);
          }

          // Aguarda um pouco entre as buscas
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return arquivosCsv;
    } catch (error) {
      logger.error('❌ Erro ao extrair leads por nicho:', error);
      throw error;
    }
  }

  /**
   * Extrai leads de uma área específica e salva em CSV
   */
  public async extrairLeads(area: string, query: string): Promise<string> {
    try {
      logger.info(`🔍 Iniciando extração de leads para: ${query}`);
      
      if (this.leadsProcessados.size >= this.limiteDiario) {
        logger.info('⚠️ Limite diário de leads atingido');
        return '';
      }

      // Simula busca de estabelecimentos (substituir por API real posteriormente)
      const estabelecimentos = await this.buscarEstabelecimentos(query);
      const leads: Lead[] = [];

      for (const estabelecimento of estabelecimentos) {
        if (leads.length >= this.limiteDiario) break;

        if (this.leadsProcessados.has(estabelecimento.telefone)) {
          continue;
        }

        const temWhatsapp = await this.verificarWhatsApp(estabelecimento.telefone);

        leads.push({
          nome: estabelecimento.nome,
          telefone: estabelecimento.telefone,
          temWhatsapp,
          endereco: estabelecimento.endereco,
          site: estabelecimento.site
        });

        this.leadsProcessados.add(estabelecimento.telefone);
      }

      const leadsComWhatsapp = leads.filter(lead => lead.temWhatsapp);
      const leadsSemWhatsapp = leads.filter(lead => !lead.temWhatsapp);

      const arquivoCsv = await this.gerarArquivoCsv(area, query, leadsComWhatsapp, leadsSemWhatsapp);

      logger.info(`✅ Extração concluída. ${leads.length} leads encontrados`);
      logger.info(`📝 Arquivo CSV gerado: ${arquivoCsv}`);

      return arquivoCsv;

    } catch (error) {
      logger.error('❌ Erro ao extrair leads:', error);
      throw error;
    }
  }

  /**
   * Gera arquivo CSV com as duas listas de leads
   */
  private async gerarArquivoCsv(
    area: string,
    query: string,
    leadsComWhatsapp: Lead[],
    leadsSemWhatsapp: Lead[]
  ): Promise<string> {
    try {
      const diretorio = path.join(process.cwd(), 'leads');
      await fs.mkdir(diretorio, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const nomeArquivo = `${area.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`;
      const caminhoArquivo = path.join(diretorio, nomeArquivo);

      const dadosCsv = [
        ['LEADS COM WHATSAPP'],
        ['Nome do Estabelecimento', 'Número de Telefone', 'Endereço', 'Site'],
        ...leadsComWhatsapp.map(lead => [
          lead.nome,
          lead.telefone,
          lead.endereco || '',
          lead.site || ''
        ]),
        [],
        ['LEADS SEM WHATSAPP'],
        ['Nome do Estabelecimento', 'Número de Telefone', 'Endereço', 'Site'],
        ...leadsSemWhatsapp.map(lead => [
          lead.nome,
          lead.telefone,
          lead.endereco || '',
          lead.site || ''
        ])
      ];

      const csv = stringify(dadosCsv);
      await fs.writeFile(caminhoArquivo, csv, 'utf-8');

      return caminhoArquivo;
    } catch (error) {
      logger.error('❌ Erro ao gerar arquivo CSV:', error);
      throw error;
    }
  }

  /**
   * Busca estabelecimentos (simulado)
   */
  private async buscarEstabelecimentos(query: string): Promise<Array<{ nome: string; telefone: string; endereco?: string; site?: string }>> {
    // Simula uma lista de estabelecimentos baseada no nicho
    const estabelecimentos = [
      { 
        nome: 'Escritório de Advocacia Silva & Associados', 
        telefone: '11999999999',
        endereco: 'Av. Paulista, 1000 - São Paulo',
        site: 'https://www.silvaadvogados.com.br'
      },
      { 
        nome: 'Clínica Saúde Total', 
        telefone: '11988888888',
        endereco: 'Rua Augusta, 500 - São Paulo',
        site: 'https://www.saudetotal.com.br'
      },
      { 
        nome: 'Colégio Futuro', 
        telefone: '11977777777',
        endereco: 'Rua Consolação, 2000 - São Paulo',
        site: 'https://www.colegiofuturo.com.br'
      },
      { 
        nome: 'Imobiliária Casa Nova', 
        telefone: '11966666666',
        endereco: 'Av. Brigadeiro Faria Lima, 1500 - São Paulo',
        site: 'https://www.casanova.com.br'
      },
      { 
        nome: 'Escritório de Contabilidade ABC', 
        telefone: '11955555555',
        endereco: 'Rua Oscar Freire, 800 - São Paulo',
        site: 'https://www.contabilidadeabc.com.br'
      }
    ];

    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    return estabelecimentos;
  }

  /**
   * Verifica se um número tem WhatsApp
   */
  private async verificarWhatsApp(telefone: string): Promise<boolean> {
    try {
      const numeroFormatado = this.formatarNumero(telefone);
      const numeros = numeroFormatado.replace(/\D/g, '');
      return numeros.length === 11 || numeros.length === 13;
    } catch (error) {
      logger.error(`❌ Erro ao verificar WhatsApp para ${telefone}:`, error);
      return false;
    }
  }

  /**
   * Formata o número para o padrão internacional
   */
  private formatarNumero(telefone: string): string {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `55${numeros}`;
    }
    return numeros;
  }

  /**
   * Reseta o contador de leads processados
   */
  public resetarContador(): void {
    this.leadsProcessados.clear();
    logger.info('🔄 Contador de leads resetado');
  }
} 