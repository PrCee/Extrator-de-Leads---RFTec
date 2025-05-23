export interface PromptConfig {
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