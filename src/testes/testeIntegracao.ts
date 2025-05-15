import { GoogleMapsExtractor } from '../service/googleMapsExtractor';
import { transcreverAudio } from '../service/audio';
import { logger } from '../utils/logger';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function testarExtracaoLeads() {
  try {
    logger.info('🧪 Iniciando teste de extração de leads...');
    const extrator = GoogleMapsExtractor.getInstance();
    const leads = await extrator.buscarEstabelecimentos('Dentistas São Paulo', 5);
    
    logger.info(`✅ Teste de extração concluído! ${leads.length} leads encontrados`);
    return true;
  } catch (error) {
    logger.error('❌ Erro no teste de extração:', error);
    return false;
  }
}

async function testarProcessamentoAudio() {
  try {
    logger.info('🧪 Iniciando teste de processamento de áudio...');
    
    // Cria um arquivo de áudio de teste (1 segundo de silêncio)
    const audioTest = Buffer.alloc(16000 * 2); // 1 segundo de áudio PCM
    const audioPath = join(__dirname, 'test-audio.raw');
    await writeFile(audioPath, audioTest);
    
    // Tenta transcrever o áudio
    const transcricao = await transcreverAudio(audioTest);
    
    logger.info('✅ Teste de áudio concluído!', transcricao);
    return true;
  } catch (error) {
    logger.error('❌ Erro no teste de áudio:', error);
    return false;
  }
}

async function executarTestes() {
  logger.info('🚀 Iniciando testes de integração...');
  
  const resultados = {
    extractorLeads: await testarExtracaoLeads(),
    processamentoAudio: await testarProcessamentoAudio()
  };
  
  logger.info('\n📊 Relatório de Testes:');
  logger.info('====================');
  Object.entries(resultados).forEach(([teste, sucesso]) => {
    logger.info(`${teste}: ${sucesso ? '✅ Passou' : '❌ Falhou'}`);
  });
  
  const sucessoTotal = Object.values(resultados).every(r => r);
  logger.info('====================');
  logger.info(`Resultado Final: ${sucessoTotal ? '✅ Todos os testes passaram' : '❌ Alguns testes falharam'}`);
}

// Executa os testes
executarTestes(); 