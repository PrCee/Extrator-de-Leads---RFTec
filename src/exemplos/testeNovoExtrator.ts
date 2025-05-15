import { LeadExtractor } from '../service/leadExtractor';
import { logger } from '../utils/logger';
import fs from 'fs/promises';

async function testeNovoExtrator() {
  try {
    logger.info('🚀 Iniciando teste do novo extrator de leads...');
    
    const extrator = LeadExtractor.getInstance();
    
    // Testa extração para diferentes nichos
    const nichos = ['Advocacia', 'Clínicas', 'Educação'];
    
    for (const nicho of nichos) {
      logger.info(`\n📌 Testando extração para nicho: ${nicho}`);
      
      const arquivosCsv = await extrator.extrairLeadsPorNicho(nicho);
      
      if (arquivosCsv.length === 0) {
        logger.info(`Nenhum lead encontrado para ${nicho}`);
        continue;
      }
      
      // Lê e exibe o conteúdo dos arquivos CSV
      for (const arquivoCsv of arquivosCsv) {
        const conteudoCsv = await fs.readFile(arquivoCsv, 'utf-8');
        logger.info(`\n📊 Conteúdo do arquivo CSV: ${arquivoCsv}`);
        logger.info('===================');
        logger.info(conteudoCsv);
        logger.info('===================');
      }
      
      // Aguarda um pouco entre os nichos
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    logger.info('\n✅ Teste do novo extrator concluído com sucesso!');
    
  } catch (error) {
    logger.error('❌ Erro ao executar teste:', error);
  }
}

// Executa o teste
testeNovoExtrator(); 