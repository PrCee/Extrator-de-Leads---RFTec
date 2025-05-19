import dotenv from 'dotenv';
dotenv.config();

interface PromptConfig {
  name: string;
  personality: {
    tone: string;
    language_style: string;
    empathy_level: string;
    humor_level: string;
  };
  context: {
    business_type: string;
    target_audience: string;
    specialties: string[];
  };
  conversation_style: {
    approach: string;
    formality: string;
    pace: string;
  };
  knowledge_base: {
    industry_terms: string[];
    pain_points: string[];
  };
  response_templates: {
    greeting: string;
    pain_point: string;
    closing: string;
  };
  behavior_rules: string[];
}

interface WhitelistConfig {
  [phoneNumber: string]: PromptConfig;
}

// Função para carregar a configuração da lista branca do .env
export function loadWhitelistConfig(): WhitelistConfig {
  try {
    const configStr = process.env.PROMPTS_CONFIG;
    if (!configStr) {
      console.warn('⚠️ PROMPTS_CONFIG não encontrado no .env');
      return {};
    }
    return JSON.parse(configStr);
  } catch (error) {
    console.error('❌ Erro ao carregar PROMPTS_CONFIG:', error);
    return {};
  }
}

// Função para verificar se um número está na lista branca
export function isNumberWhitelisted(phoneNumber: string): boolean {
  const config = loadWhitelistConfig();
  // Remove o sufixo @c.us e qualquer outro caractere não numérico
  const cleanNumber = phoneNumber.replace('@c.us', '').replace(/\D/g, '');
  console.log('🔍 Verificando número:', cleanNumber);
  console.log('📋 Números na lista branca:', Object.keys(config));
  return !!config[cleanNumber];
}

// Função para obter o prompt personalizado de um número
export function getPersonalizedPrompt(phoneNumber: string): string {
  const config = loadWhitelistConfig();
  const numberConfig = config[phoneNumber];
  
  if (!numberConfig) {
    return process.env.DEFAULT_PROMPT || 'Você é um assistente virtual amigável e prestativo.';
  }

  // Constrói o prompt personalizado baseado na configuração
  return `
Você é um assistente virtual para ${numberConfig.name}.

Personalidade:
- Tom: ${numberConfig.personality.tone}
- Estilo de linguagem: ${numberConfig.personality.language_style}
- Nível de empatia: ${numberConfig.personality.empathy_level}
- Nível de humor: ${numberConfig.personality.humor_level}

Contexto do negócio:
- Tipo: ${numberConfig.context.business_type}
- Público-alvo: ${numberConfig.context.target_audience}
- Especialidades: ${numberConfig.context.specialties.join(', ')}

Estilo de conversa:
- Abordagem: ${numberConfig.conversation_style.approach}
- Formalidade: ${numberConfig.conversation_style.formality}
- Ritmo: ${numberConfig.conversation_style.pace}

Base de conhecimento:
- Termos da indústria: ${numberConfig.knowledge_base.industry_terms.join(', ')}
- Pontos de dor: ${numberConfig.knowledge_base.pain_points.join(', ')}

Templates de resposta:
- Saudação: ${numberConfig.response_templates.greeting}
- Ponto de dor: ${numberConfig.response_templates.pain_point}
- Encerramento: ${numberConfig.response_templates.closing}

Regras de comportamento:
${numberConfig.behavior_rules.map(rule => `- ${rule}`).join('\n')}

Mantenha um tom natural e conversacional, adaptando sua linguagem ao perfil do cliente, mantendo sempre o respeito e profissionalismo.
`;
}

// Configuração padrão caso o .env não esteja disponível
export const defaultWhitelistConfig: WhitelistConfig = {
  '5511999594152': {
    name: 'Consultor de Restaurantes',
    personality: {
      tone: 'Amigável e profissional',
      language_style: 'Conversacional',
      empathy_level: 'alto',
      humor_level: 'moderado'
    },
    context: {
      business_type: 'Prospecção de restaurantes',
      target_audience: 'Donos e gestores de restaurantes',
      specialties: ['Marketing digital', 'Divulgação', 'Atração de clientes']
    },
    conversation_style: {
      approach: 'consultivo',
      formality: 'semiformal',
      pace: 'moderado'
    },
    knowledge_base: {
      industry_terms: ['gastronomia', 'delivery', 'marketing gastronômico'],
      pain_points: ['baixo movimento', 'concorrência', 'fidelização de clientes']
    },
    response_templates: {
      greeting: 'Olá! Sou especialista em marketing para restaurantes e ajudo estabelecimentos a aumentarem seu faturamento.',
      pain_point: 'Entendo os desafios de se destacar no mercado gastronômico. Nossa solução pode ajudar a {benefício}',
      closing: 'Que tal uma conversa rápida sobre como podemos aumentar a visibilidade do seu restaurante?'
    },
    behavior_rules: [
      'Focar em resultados práticos',
      'Usar cases de sucesso do setor',
      'Manter tom amigável mas profissional',
      'Destacar benefícios tangíveis',
      'Propor próximos passos claros'
    ]
  }
}; 