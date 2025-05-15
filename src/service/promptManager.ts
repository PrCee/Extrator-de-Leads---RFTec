import { PROMPTS_SOPHIA } from '../config/prompts/vendedor';
import { logger } from '../utils/logger';

interface PromptConfig {
  nicho?: 'restaurante' | 'barbearia' | 'transportadora';  // Adicionando o tipo transportadora
  nomeEmpresa: string;
  produtos: string[];
  diferenciais: string[];
  precos: string[];
}

export class PromptManager {
  private static instance: PromptManager;
  private prompts: typeof PROMPTS_SOPHIA;

  private constructor() {
    this.prompts = PROMPTS_SOPHIA;
  }

  public static getInstance(): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager();
    }
    return PromptManager.instance;
  }

  public gerarPromptSophia(config: PromptConfig): string {
    try {
      // Começa com as regras fixas essenciais
      let promptFinal = this.prompts.rules;

      // Adiciona o prompt base
      promptFinal += '\n\n' + this.prompts.base;

      // Adiciona prompt específico do nicho se existir
      if (config.nicho && this.prompts.nichos[config.nicho]) {
        promptFinal += '\n\n' + this.prompts.nichos[config.nicho];
      }

      // Adiciona a estratégia de preço surpresa
      promptFinal += '\n\n' + this.prompts.estrategiaPrecoSurpresa;

      // Adiciona informações específicas da empresa
      promptFinal += `\n\nINFORMAÇÕES DA EMPRESA:
Nome: ${config.nomeEmpresa}
Produtos: ${config.produtos.join(', ')}
Diferenciais: ${config.diferenciais.join(', ')}
Faixa de Preços: ${config.precos.join(', ')}`;

      // Adiciona templates de resposta
      promptFinal += '\n\nTEMPLATES DE RESPOSTA:';
      Object.entries(this.prompts.templates).forEach(([key, template]) => {
        promptFinal += `\n\n${key.toUpperCase()}:\n${template}`;
      });

      logger.info('Prompt da SophIA gerado com sucesso');
      return promptFinal;
    } catch (error) {
      logger.error('Erro ao gerar prompt da SophIA:', error);
      throw error;
    }
  }

  public getTemplate(tipo: keyof typeof PROMPTS_SOPHIA.templates): string {
    return this.prompts.templates[tipo] || '';
  }
} 