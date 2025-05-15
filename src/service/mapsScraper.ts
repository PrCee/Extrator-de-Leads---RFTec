import { logger } from '../utils/logger';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '../config/keys';

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

interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:postcode'?: string;
    'addr:city'?: string;
    phone?: string;
    'contact:phone'?: string;
    amenity?: string;
    shop?: string;
    office?: string;
  };
}

export class MapsScraper {
  private static instance: MapsScraper;
  private readonly OSM_API_URL = 'https://overpass-api.de/api/interpreter';
  private readonly GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;
  private browser: any = null;

  private constructor() {}

  public static getInstance(): MapsScraper {
    if (!MapsScraper.instance) {
      MapsScraper.instance = new MapsScraper();
    }
    return MapsScraper.instance;
  }

  /**
   * Gera um delay aleatório entre min e max milissegundos
   */
  private async delayAleatorio(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Verifica se um número de telefone tem WhatsApp
   */
  private async verificarWhatsApp(telefone: string): Promise<boolean> {
    try {
      // Remove caracteres não numéricos
      const numeroLimpo = telefone.replace(/\D/g, '');
      
      // Verifica se é um número válido
      if (numeroLimpo.length < 10 || numeroLimpo.length > 13) {
        logger.info(`❌ Número inválido: ${telefone} (${numeroLimpo.length} dígitos)`);
        return false;
      }
      
      // Verifica se é um número brasileiro
      if (!numeroLimpo.startsWith('55')) {
        // Tenta adicionar o código do Brasil
        const numeroComPais = `55${numeroLimpo}`;
        if (numeroComPais.length >= 12 && numeroComPais.length <= 13) {
          logger.info(`ℹ️ Adicionando código do Brasil ao número: ${telefone} -> +${numeroComPais}`);
          return true;
        }
        logger.info(`❌ Número não brasileiro: ${telefone}`);
        return false;
      }
      
      // Lista de prefixos de operadoras brasileiras
      const prefixosOperadoras = [
        '11', '21', '31', '41', '51', '61', '71', '81', '91',
        '19', '27', '28', '32', '33', '34', '35', '37', '38', '39',
        '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'
      ];
      
      // Verifica se o DDD está na lista de operadoras
      const ddd = numeroLimpo.substring(2, 4);
      if (!prefixosOperadoras.includes(ddd)) {
        logger.info(`❌ DDD não reconhecido: ${ddd} (número: ${telefone})`);
        return false;
      }
      
      logger.info(`✅ Número válido com WhatsApp: ${telefone}`);
      return true;
    } catch (error) {
      logger.error('❌ Erro ao verificar WhatsApp:', error);
      return false;
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
   * Constrói a query Overpass para buscar estabelecimentos
   */
  private construirQueryOverpass(query: string, cidade: string): string {
    const tiposNegocio = {
      restaurante: ['amenity=restaurant'],
      barbearia: ['shop=hairdresser'],
      dentista: ['amenity=dentist'],
      academia: ['leisure=fitness_centre', 'amenity=gym'],
      estabelecimento: ['amenity', 'shop', 'office']
    };

    const tipo = this.determinarTipoNegocio(query);
    const filtros = tiposNegocio[tipo as keyof typeof tiposNegocio];
    
    // Constrói a query com a sintaxe correta do Overpass
    return `[out:json][timeout:25];
area["name:pt"="${cidade}"]->.searchArea;
(
  ${filtros.map(filtro => {
    const [key, value] = filtro.split('=');
    return `
  node["name"~"${query}",i]["${key}"${value ? `="${value}"` : ''}](area.searchArea);
  way["name"~"${query}",i]["${key}"${value ? `="${value}"` : ''}](area.searchArea);
  relation["name"~"${query}",i]["${key}"${value ? `="${value}"` : ''}](area.searchArea);
  `;
  }).join('')}
);
out body;
>;
out skel qt;`;
  }

  /**
   * Formata o endereço completo
   */
  private formatarEndereco(node: OSMNode): string {
    const { tags } = node;
    const partes = [
      tags['addr:street'],
      tags['addr:housenumber'],
      tags['addr:postcode'],
      tags['addr:city']
    ].filter(Boolean);
    
    return partes.join(', ');
  }

  /**
   * Busca estabelecimentos usando Google Maps
   */
  public async buscarEstabelecimentos(
    query: string,
    maxResults: number = 20
  ): Promise<Lead[]> {
    try {
      logger.info(`🔍 Iniciando busca por: ${query}`);
      
      // Extrair cidade da query (assumindo formato "Tipo Cidade")
      const [tipo, ...cidadeParts] = query.split(' ');
      const cidade = cidadeParts.join(' ');
      
      // Construir a URL para a API do Google Places
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
      
      // Parâmetros da requisição
      const params = {
        query: query,
        key: this.GOOGLE_MAPS_API_KEY,
        language: 'pt-BR',
        region: 'br'
      };
      
      logger.info('🌐 Enviando requisição para Google Maps API...');
      
      // Fazer a requisição para a API do Google Places
      const response = await axios.get(url, { params });
      
      if (response.data.status !== 'OK') {
        logger.error(`❌ Erro na API do Google Maps: ${response.data.status}`);
        logger.error(`❌ Mensagem de erro: ${response.data.error_message || 'Sem mensagem de erro'}`);
        throw new Error(`Erro na API do Google Maps: ${response.data.status} - ${response.data.error_message || 'Sem mensagem de erro'}`);
      }
      
      const results = response.data.results;
      logger.info(`✅ Encontrados ${results.length} estabelecimentos no Google Maps`);
      
      const leads: Lead[] = [];
      
      for (const place of results) {
        if (leads.length >= maxResults) break;
        
        // Obter detalhes do estabelecimento
        const placeId = place.place_id;
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
        const detailsParams = {
          place_id: placeId,
          key: this.GOOGLE_MAPS_API_KEY,
          fields: 'formatted_phone_number,rating,user_ratings_total'
        };
        
        const detailsResponse = await axios.get(detailsUrl, { params: detailsParams });
        
        if (detailsResponse.data.status !== 'OK') {
          logger.warn(`⚠️ Não foi possível obter detalhes para: ${place.name}`);
          continue;
        }
        
        const details = detailsResponse.data.result;
        const telefone = details.formatted_phone_number;
        
        if (!telefone) {
          logger.info(`ℹ️ Estabelecimento sem telefone: ${place.name}`);
          continue;
        }
        
        const temWhatsapp = await this.verificarWhatsApp(telefone);
        if (!temWhatsapp) {
          logger.info(`ℹ️ Telefone sem WhatsApp: ${telefone}`);
          continue;
        }
        
        leads.push({
          placeId: placeId,
          nome: place.name,
          endereco: place.formatted_address,
          telefone,
          tipoNegocio: this.determinarTipoNegocio(query),
          avaliacao: place.rating || 0,
          totalAvaliacoes: place.user_ratings_total || 0,
          temWhatsapp: true
        });
        
        logger.info(`✅ Lead encontrado: ${place.name} - ${telefone}`);
        await this.delayAleatorio(1000, 2000); // Delay para evitar sobrecarga
      }
      
      logger.info(`✅ Busca no Google Maps concluída. ${leads.length} leads encontrados`);
      return leads;
      
    } catch (error) {
      logger.error('❌ Erro durante a busca no Google Maps:', error);
      throw error;
    }
  }

  /**
   * Fecha o navegador se estiver aberto
   */
  public async closeBrowser(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        logger.info('✅ Navegador fechado com sucesso');
      }
    } catch (error) {
      logger.error('❌ Erro ao fechar navegador:', error);
    }
  }
} 