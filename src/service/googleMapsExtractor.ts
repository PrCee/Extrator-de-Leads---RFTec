import puppeteer from 'puppeteer';
import { logger } from '../utils/logger';

interface Lead {
  nome: string;
  endereco: string;
  telefone: string;
  tipoNegocio: string;
  avaliacao: number;
  totalAvaliacoes: number;
  dataColeta: Date;
}

export class GoogleMapsExtractor {
  private static instance: GoogleMapsExtractor;
  private browser: puppeteer.Browser | null = null;

  private constructor() {}

  public static async getInstance(): Promise<GoogleMapsExtractor> {
    if (!GoogleMapsExtractor.instance) {
      GoogleMapsExtractor.instance = new GoogleMapsExtractor();
      await GoogleMapsExtractor.instance.initialize();
    }
    return GoogleMapsExtractor.instance;
  }

  private async initialize() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  public async buscarEstabelecimentos(termo: string, limite: number = 20): Promise<Lead[]> {
    if (!this.browser) {
      throw new Error('Navegador não inicializado');
    }

    const page = await this.browser.newPage();
    const leads: Lead[] = [];

    try {
      // Acessa o Google Maps
      await page.goto('https://www.google.com/maps');
      await page.waitForSelector('input[name="q"]');

      // Digite o termo de busca
      await page.type('input[name="q"]', termo);
      await page.keyboard.press('Enter');

      // Aguarda os resultados carregarem
      await page.waitForSelector('div[role="feed"]');

      // Rola a página para carregar mais resultados
      for (let i = 0; i < limite / 20; i++) {
        await page.evaluate(() => {
          const feed = document.querySelector('div[role="feed"]');
          if (feed) {
            feed.scrollTop = feed.scrollHeight;
          }
        });
        await page.waitForTimeout(1000);
      }

      // Extrai os dados dos estabelecimentos
      const estabelecimentos = await page.$$('div[role="article"]');
      
      for (const estabelecimento of estabelecimentos.slice(0, limite)) {
        try {
          // Clica no estabelecimento para abrir os detalhes
          await estabelecimento.click();
          await page.waitForTimeout(1000);

          // Extrai as informações
          const nome = await page.$eval('h1', el => el.textContent?.trim() || '');
          const endereco = await page.$eval('button[data-item-id="address"]', el => el.textContent?.trim() || '');
          const telefone = await page.$eval('button[data-item-id="phone:tel:"]', el => el.textContent?.trim() || '');
          const avaliacao = await page.$eval('span[role="img"]', el => {
            const text = el.getAttribute('aria-label') || '';
            const match = text.match(/(\d+[.,]\d+)/);
            return match ? parseFloat(match[1].replace(',', '.')) : 0;
          });
          const totalAvaliacoes = await page.$eval('span[role="img"]', el => {
            const text = el.getAttribute('aria-label') || '';
            const match = text.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
          });

          leads.push({
            nome,
            endereco,
            telefone,
            tipoNegocio: termo.split(' ')[0],
            avaliacao,
            totalAvaliacoes,
            dataColeta: new Date()
          });

        } catch (error) {
          logger.error('Erro ao extrair dados do estabelecimento:', error);
          continue;
        }
      }

    } catch (error) {
      logger.error('Erro ao buscar estabelecimentos:', error);
    } finally {
      await page.close();
    }

    return leads;
  }

  public async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 