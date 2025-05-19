# Extrator de Leads - RFTec

Este é um extrator de leads automatizado que busca informações de empresas no Google Maps.

## Funcionalidades

- Extração de leads por nicho de mercado
- Verificação de números com WhatsApp
- Geração de relatórios em CSV
- Simulação de comportamento humano para evitar bloqueios
- Suporte a múltiplas áreas geográficas

## Requisitos

- Python 3.8+
- Chrome Browser instalado
- Conexão com internet

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/PrCee/Extrator-de-Leads---RFTec.git
cd Extrator-de-Leads---RFTec
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Uso

1. Configure as áreas e nichos no arquivo `config.py`

2. Execute o extrator:
```bash
python main.py
```

## Estrutura do Projeto

```
.
├── README.md
├── requirements.txt
├── config.py
├── main.py
├── src/
│   ├── __init__.py
│   ├── extrator.py
│   └── utils.py
└── leads/
    └── (arquivos CSV gerados)
```

## Configuração

Você pode configurar:
- Nichos de mercado
- Áreas geográficas
- Limite diário de leads
- Termos de busca

Edite o arquivo `config.py` para personalizar estas configurações.

## Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue para discutir mudanças propostas.

## Licença

Este projeto está sob a licença MIT.
