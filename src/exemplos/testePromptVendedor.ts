import { PromptManager } from '../service/promptManager';
import { logger } from '../utils/logger';

async function testePromptVendedor() {
  try {
    // Obtém instância do gerenciador de prompts
    const promptManager = PromptManager.getInstance();

    // Configuração para um restaurante
    const configRestaurante = {
      nicho: 'restaurante' as const,
      nomeEmpresa: 'Restaurante Sabor & Arte',
      produtos: [
        'Pratos executivos',
        'Pizzas artesanais',
        'Hambúrgueres gourmet',
        'Sobremesas caseiras'
      ],
      diferenciais: [
        'Chef renomado',
        'Ambiente climatizado',
        'Delivery rápido',
        'Cardápio sazonal'
      ],
      precos: [
        'Pratos executivos: R$ 25-35',
        'Pizzas: R$ 45-65',
        'Hambúrgueres: R$ 35-45',
        'Sobremesas: R$ 15-25'
      ]
    };

    // Gera prompt para o restaurante
    const promptRestaurante = promptManager.gerarPromptSophia(configRestaurante);
    
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
      const presente = promptRestaurante.includes(regra);
      logger.info(`${presente ? '✅' : '❌'} ${regra}`);
    });

    // Exibe o prompt completo
    logger.info('\n📝 Prompt completo gerado:');
    logger.info(promptRestaurante);

  } catch (error) {
    logger.error('❌ Erro ao executar teste:', error);
  }
}

// Executa o teste
testePromptVendedor(); 