import requests
import pandas as pd
import time

API_KEY = 'AIzaSyDeNMN9xmMebh96IOUWCG8-XOM2hvuP_vE'

# Parâmetros de busca
nicho = 'escritório comercial'
cidade = 'Guarulhos'
query = f'{nicho} em {cidade}'

# Endpoint da API Places
PLACES_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'

leads = []
next_page_token = None

print(f'Buscando por: {query}')

while True:
    params = {
        'query': query,
        'key': API_KEY,
    }
    if next_page_token:
        params['pagetoken'] = next_page_token
        time.sleep(2)  # Google recomenda aguardar antes de usar o next_page_token

    response = requests.get(PLACES_URL, params=params)
    data = response.json()

    for result in data.get('results', []):
        place_id = result['place_id']
        nome = result.get('name')
        endereco = result.get('formatted_address')
        telefone = ''

        # Buscar detalhes para pegar o telefone
        details_params = {
            'place_id': place_id,
            'fields': 'formatted_phone_number',
            'key': API_KEY
        }
        details_resp = requests.get(DETAILS_URL, params=details_params)
        details_data = details_resp.json()
        telefone = details_data.get('result', {}).get('formatted_phone_number', '')

        leads.append({
            'nome': nome,
            'endereco': endereco,
            'telefone': telefone
        })
        print(f'Lead: {nome} | {endereco} | {telefone}')

    next_page_token = data.get('next_page_token')
    if not next_page_token:
        break

# Salvar em CSV
if leads:
    df = pd.DataFrame(leads)
    df.to_csv('leads_escritorios_guarulhos.csv', index=False, encoding='utf-8-sig')
    print(f'Arquivo CSV gerado com {len(leads)} leads!')
else:
    print('Nenhum lead encontrado.') 