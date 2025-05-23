import { Client } from '@googlemaps/google-maps-services-js';
import { logger } from '../utils/logger';
import { GOOGLE_MAPS_API_KEY } from '../config/keys';
import { LeadStorage } from './leadStorage';
import axios from 'axios';

interface Lead {
  placeId: string;
  nome: string;
  endereco: string;
  telefone: string;
  tipoNegocio: string;
  avaliacao: number;
  totalAvaliacoes: number;
  temWhatsapp: boolean;
  dataColeta: string;
}

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
}

export class GoogleMapsExtractor {
  private static instance: GoogleMapsExtractor;
  private client: Client;
  private readonly apiKey: string;
  private leadStorage!: LeadStorage;

  private constructor() {
    this.client = new Client({});
    this.apiKey = GOOGLE_MAPS_API_KEY;
  }

  public static async getInstance(): Promise<GoogleMapsExtractor> {
    if (!GoogleMapsExtractor.instance) {
      GoogleMapsExtractor.instance = new GoogleMapsExtractor();
      GoogleMapsExtractor.instance.leadStorage = await LeadStorage.getInstance();
    }
    return GoogleMapsExtractor.instance;
  }

  public async buscarEstabelecimentos(
    query: string,
    maxResults: number = 20
  ): Promise<Lead[]> {
    try {
      logger.info(`🔍 Buscando estabelecimentos para: ${query}`);
      
      // Busca estabelecimentos na API do Google Maps
      const results = await this.buscarNaAPI(query);
      const leads: Lead[] = [];

      for (const place of results) {
        if (leads.length >= maxResults) break;

        // Verifica se o lead já existe no banco de dados
        const leadExistente = await this.leadStorage.verificarLeadExistente(place.place_id);
        if (leadExistente) {
          logger.info(`ℹ️ Lead já existente: ${place.name}`);
          continue;
        }

        // Obter detalhes do estabelecimento
        const placeId = place.place_id;
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
        const detailsParams = {
          place_id: placeId,
          key: this.apiKey,
          fields: 'formatted_phone_number,rating,user_ratings_total'
        };

        const detailsResponse = await axios.get(detailsUrl, { params: detailsParams });

        if (detailsResponse.data.status !== 'OK') {
          logger.warn(`⚠️ Não foi possível obter detalhes para: ${place.name}`);
          continue;
        }

        const details = detailsResponse.data.result;
        const telefone = details.formatted_phone_number || '';

        if (!telefone) {
          logger.info(`ℹ️ Estabelecimento sem telefone: ${place.name}`);
          continue;
        }

        const temWhatsapp = await this.verificarWhatsApp(telefone);
        if (!temWhatsapp) {
          logger.info(`ℹ️ Telefone sem WhatsApp: ${telefone}`);
          continue;
        }

        const lead: Lead = {
          placeId: placeId,
          nome: place.name,
          endereco: place.formatted_address,
          telefone,
          tipoNegocio: this.determinarTipoNegocio(query),
          avaliacao: place.rating || 0,
          totalAvaliacoes: place.user_ratings_total || 0,
          temWhatsapp: true,
          dataColeta: new Date().toISOString()
        };

        // Salva o lead no banco de dados
        await this.leadStorage.salvarLead(lead);
        leads.push(lead);

        logger.info(`✅ Lead encontrado e salvo: ${place.name} - ${telefone}`);
        await this.delayAleatorio(1000, 2000); // Delay para evitar sobrecarga
      }

      logger.info(`✅ Busca no Google Maps concluída. ${leads.length} leads encontrados`);
      return leads;

    } catch (error) {
      logger.error('❌ Erro durante a busca no Google Maps:', error);
      throw error;
    }
  }

  private async buscarNaAPI(query: string): Promise<PlaceResult[]> {
    try {
      const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
      const response = await axios.get(url, {
        params: {
          query,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Erro na API do Google Maps: ${response.data.status}`);
      }

      return response.data.results;
    } catch (error) {
      logger.error('❌ Erro ao buscar na API do Google Maps:', error);
      throw error;
    }
  }

  private async delayAleatorio(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private determinarTipoNegocio(query: string): string {
    const termos = query.toLowerCase().split(' ');
    return termos[0] || 'desconhecido';
  }

  private async verificarWhatsApp(telefone: string): Promise<boolean> {
    try {
      // Remove caracteres não numéricos
      const numeroLimpo = telefone.replace(/\D/g, '');
      
      // Verifica se é um número válido
      if (numeroLimpo.length < 10 || numeroLimpo.length > 13) {
        return false;
      }

      // Verifica se é um número brasileiro
      if (!numeroLimpo.startsWith('55')) {
        return false;
      }

      // Aqui você pode adicionar mais validações específicas
      // Por exemplo, verificar se o número está em uma lista de operadoras que suportam WhatsApp

      return true;
    } catch (error) {
      logger.error('Erro ao verificar WhatsApp:', error);
      return false;
    }
  }
} 