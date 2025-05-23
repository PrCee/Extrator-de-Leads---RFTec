import { PromptManager } from '../service/promptManager';
import { logger } from '../utils/logger';

async function exemploUsoPromptManager() {
  try {
    // Obtém instância do gerenciador de prompts
    const promptManager = PromptManager.getInstance();

    // Configuração para um restaurante
    const configRestaurante = {
      nicho: 'restaurante',
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
    const promptRestaurante = promptManager.gerarPromptVendedor(configRestaurante);
    logger.info('Prompt gerado para restaurante:', promptRestaurante);

    // Obtém template específico
    const templateApresentacao = promptManager.getTemplate('apresentacao');
    logger.info('Template de apresentação:', templateApresentacao);

    // Configuração para uma barbearia
    const configBarbearia = {
      nicho: 'barbearia',
      nomeEmpresa: 'Barbearia Vintage',
      produtos: [
        'Corte de cabelo',
        'Barba',
        'Hidratação',
        'Coloração'
      ],
      diferenciais: [
        'Barbeiros experientes',
        'Ambiente retrô',
        'Produtos premium',
        'Horário estendido'
      ],
      precos: [
        'Corte: R$ 35-50',
        'Barba: R$ 25-35',
        'Combo (corte + barba): R$ 60-80',
        'Hidratação: R$ 40-60'
      ]
    };

    // Gera prompt para a barbearia
    const promptBarbearia = promptManager.gerarPromptVendedor(configBarbearia);
    logger.info('Prompt gerado para barbearia:', promptBarbearia);

  } catch (error) {
    logger.error('Erro ao executar exemplo:', error);
  }
}

// Executa o exemplo
exemploUsoPromptManager(); 