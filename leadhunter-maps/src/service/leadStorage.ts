import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { logger } from '../utils/logger';
import path from 'path';

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

export class LeadStorage {
  private static instance: LeadStorage;
  private db: any;

  private constructor() {}

  public static async getInstance(): Promise<LeadStorage> {
    if (!LeadStorage.instance) {
      LeadStorage.instance = new LeadStorage();
      await LeadStorage.instance.initialize();
    }
    return LeadStorage.instance;
  }

  private async initialize() {
    try {
      // Cria o diretório data se não existir
      const dbPath = path.join(process.cwd(), 'data');
      await this.ensureDirectoryExists(dbPath);

      // Inicializa o banco de dados
      this.db = await open({
        filename: path.join(dbPath, 'leads.db'),
        driver: sqlite3.Database
      });

      // Cria a tabela de leads se não existir
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS leads (
          placeId TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          endereco TEXT,
          telefone TEXT NOT NULL,
          tipoNegocio TEXT,
          avaliacao REAL,
          totalAvaliacoes INTEGER,
          temWhatsapp BOOLEAN,
          dataColeta TEXT NOT NULL
        )
      `);

      logger.info('✅ Banco de dados de leads inicializado com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  private async ensureDirectoryExists(dir: string) {
    const fs = require('fs').promises;
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  public async salvarLead(lead: Lead): Promise<boolean> {
    try {
      const stmt = await this.db.prepare(`
        INSERT OR IGNORE INTO leads (
          placeId, nome, endereco, telefone, tipoNegocio,
          avaliacao, totalAvaliacoes, temWhatsapp, dataColeta
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      await stmt.run(
        lead.placeId,
        lead.nome,
        lead.endereco,
        lead.telefone,
        lead.tipoNegocio,
        lead.avaliacao,
        lead.totalAvaliacoes,
        lead.temWhatsapp ? 1 : 0,
        new Date().toISOString()
      );

      await stmt.finalize();
      return true;
    } catch (error) {
      logger.error('❌ Erro ao salvar lead:', error);
      return false;
    }
  }

  public async verificarLeadExistente(placeId: string): Promise<boolean> {
    try {
      const result = await this.db.get(
        'SELECT 1 FROM leads WHERE placeId = ?',
        placeId
      );
      return !!result;
    } catch (error) {
      logger.error('❌ Erro ao verificar lead existente:', error);
      return false;
    }
  }

  public async buscarLeadsPorPeriodo(
    dataInicio: string,
    dataFim: string
  ): Promise<Lead[]> {
    try {
      return await this.db.all(
        'SELECT * FROM leads WHERE dataColeta BETWEEN ? AND ?',
        [dataInicio, dataFim]
      );
    } catch (error) {
      logger.error('❌ Erro ao buscar leads por período:', error);
      return [];
    }
  }

  public async buscarLeadsPorTipoNegocio(tipoNegocio: string): Promise<Lead[]> {
    try {
      return await this.db.all(
        'SELECT * FROM leads WHERE tipoNegocio = ?',
        tipoNegocio
      );
    } catch (error) {
      logger.error('❌ Erro ao buscar leads por tipo de negócio:', error);
      return [];
    }
  }
} 