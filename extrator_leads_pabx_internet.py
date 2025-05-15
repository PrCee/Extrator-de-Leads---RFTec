import requests
import pandas as pd
import time
import random
import os

API_KEY = 'AIzaSyDeNMN9xmMebh96IOUWCG8-XOM2hvuP_vE'

# Tipos de empresas que geralmente precisam de ramais
nichos = [
    'distribuidora',
    'atacado',
    'depósito',
    'armazém',
    'logística',
    'transportadora',
    'concessionária',
    'revenda',
    'representante comercial',
    'prestadora de serviços',
    'consultoria empresarial',
    'escritório de engenharia',
    'escritório de arquitetura',
    'agência de publicidade',
    'agência de marketing',
    'imobiliária',
    'corretora de seguros',
    'clínica médica',
    'laboratório',
    'escola particular'
]

# Áreas comerciais e industriais
areas = [
    'Cumbica, Guarulhos',
    'Vila Galvão, Guarulhos',
    'Jardim Cumbica, Guarulhos',
    'Vila Barros, Guarulhos',
    'Jardim São João, Guarulhos',
    'Arujá',
    'Centro Industrial de Arujá',
    'Tucuruvi, São Paulo',
    'Santana, São Paulo',
    'Vila Maria, São Paulo',
    'Vila Guilherme, São Paulo',
    'Vila Nova Cachoeirinha, São Paulo',
    'Pirituba, São Paulo',
    'Jaraguá, São Paulo'
]

def carregar_leads_anteriores():
    """Carrega leads de arquivos anteriores para evitar duplicatas"""
    leads_anteriores = set()
    arquivos = ['leads_pabx_internet.csv', 'leads_industrias.csv']
    
    for arquivo in arquivos:
        if os.path.exists(arquivo):
            try:
                df = pd.read_csv(arquivo)
                if 'telefone' in df.columns:
                    leads_anteriores.update(df['telefone'].astype(str).tolist())
            except Exception as e:
                print(f'Erro ao ler arquivo {arquivo}: {str(e)}')
    
    return leads_anteriores

def buscar_leads():
    leads = []
    telefones_unicos = set()
    total_requisicoes = 0
    
    # Carregar leads anteriores para evitar duplicatas
    leads_anteriores = carregar_leads_anteriores()
    print(f'Carregados {len(leads_anteriores)} leads anteriores para evitar duplicatas')
    
    for nicho in nichos:
        for area in areas:
            if len(leads) >= 100:
                break
                
            query = f'{nicho} em {area}'
            print(f'\nBuscando: {query}')
            
            # Buscar lugares
            params = {
                'query': query,
                'key': API_KEY
            }
            
            # Pausa aleatória entre 2 e 4 segundos
            time.sleep(random.uniform(2, 4))
            
            try:
                response = requests.get('https://maps.googleapis.com/maps/api/place/textsearch/json', params=params)
                data = response.json()
                total_requisicoes += 1
                
                if data.get('status') != 'OK':
                    print(f'Erro na busca: {data.get("status")}')
                    continue
                
                for lugar in data.get('results', []):
                    if len(leads) >= 100:
                        break
                        
                    # Pausa aleatória entre 1 e 2 segundos
                    time.sleep(random.uniform(1, 2))
                    
                    # Buscar detalhes do lugar
                    details_params = {
                        'place_id': lugar['place_id'],
                        'fields': 'formatted_phone_number,website,rating,user_ratings_total',
                        'key': API_KEY
                    }
                    
                    details = requests.get('https://maps.googleapis.com/maps/api/place/details/json', params=details_params)
                    total_requisicoes += 1
                    
                    if details.status_code != 200:
                        print(f'Erro ao buscar detalhes: {details.status_code}')
                        continue
                        
                    details_data = details.json().get('result', {})
                    telefone = details_data.get('formatted_phone_number', '')
                    
                    # Verificar se o telefone já existe em leads anteriores
                    if telefone and telefone not in leads_anteriores and telefone not in telefones_unicos:
                        leads.append({
                            'nome': lugar.get('name'),
                            'endereco': lugar.get('formatted_address'),
                            'telefone': telefone,
                            'website': details_data.get('website', ''),
                            'avaliacao': details_data.get('rating', ''),
                            'total_avaliacoes': details_data.get('user_ratings_total', ''),
                            'nicho': nicho,
                            'area': area
                        })
                        telefones_unicos.add(telefone)
                        print(f'Lead encontrado: {lugar.get("name")} | {telefone}')
                        print(f'Total de leads: {len(leads)}')
                    
                    # Pausa a cada 10 requisições
                    if total_requisicoes % 10 == 0:
                        print(f'\nPausa de 5 segundos... (Total de requisições: {total_requisicoes})')
                        time.sleep(5)
                
            except Exception as e:
                print(f'Erro durante a busca: {str(e)}')
                time.sleep(5)  # Pausa maior em caso de erro
                continue
    
    return leads

# Executar busca e salvar resultados
print('Iniciando busca de leads para ramais em nuvem...')
leads = buscar_leads()

if leads:
    df = pd.DataFrame(leads)
    df.to_csv('leads_ramais_nuvem.csv', index=False, encoding='utf-8-sig')
    print(f'\nArquivo CSV gerado com {len(leads)} leads!')
else:
    print('Nenhum lead encontrado.') 