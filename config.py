"""
Configurações do extrator de leads
"""

import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Limite diário de leads por nicho
LIMITE_DIARIO = 50

# Chave da API do Google Maps
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# Nichos de mercado e suas configurações
NICHOS = {
    'Escritórios': {
        'termos': ['escritório comercial', 'escritório empresarial', 'escritório corporativo'],
        'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
    },
    'Clínicas': {
        'termos': ['clínica médica', 'consultório médico', 'clínica de saúde', 'clínica odontológica'],
        'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
    },
    'Escolas': {
        'termos': ['escola particular', 'colégio particular', 'curso profissionalizante', 'escola técnica'],
        'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
    },
    'Imobiliárias': {
        'termos': ['imobiliária', 'corretor de imóveis', 'agência imobiliária'],
        'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
    },
    'Lojas': {
        'termos': ['loja de roupas', 'loja de calçados', 'loja de eletrônicos', 'loja de móveis'],
        'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
    },
    'Restaurantes': {
        'termos': ['restaurante', 'lanchonete', 'pizzaria', 'padaria'],
        'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
    },
    'Academias': {
        'termos': ['academia', 'academia de ginástica', 'academia de musculação'],
        'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
    },
    'Salões': {
        'termos': ['salão de beleza', 'barbearia', 'cabeleireiro'],
        'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
    }
}

# Configurações do Chrome
CHROME_OPTIONS = {
    'headless': True,
    'no_sandbox': True,
    'disable_dev_shm_usage': True,
    'disable_gpu': True,
    'window_size': '1920,1080',
    'disable_notifications': True,
    'disable_popup_blocking': True,
    'disable_blink_features': 'AutomationControlled',
    'disable_extensions': True
}

# Configurações de tempo (em segundos)
DELAYS = {
    'entre_buscas': (2, 4),
    'entre_leads': (1, 2),
    'scroll': (1, 2),
    'comportamento_humano': (0.5, 1.5)
} 