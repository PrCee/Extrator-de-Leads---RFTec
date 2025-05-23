import googlemaps
import pandas as pd
import os
from datetime import datetime
import time

class LeadExtrator:
    def __init__(self):
        self.api_key = 'AIzaSyCXAlDhjyPsFBfTYflq_M8BrNmGoyTf3AE'
        self.gmaps = googlemaps.Client(key=self.api_key)
        self.leads_processados = 0
        self.leads_por_dia = 100
        self.arquivo_historico = 'leads/leads_historico.csv'
        self.leads_historicos = self.carregar_historico()
        self.nichos = {
            'Transportadoras': {
                'termos': ['transportadora', 'empresa de transporte', 'logística', 'frete', 'transportes'],
                'areas': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça', 'Chapecó']
            },
            'Advocacia': {
                'termos': ['escritório de advocacia', 'advogado', 'escritório jurídico'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            },
            'Clínicas': {
                'termos': ['clínica médica', 'clínica de saúde', 'consultório médico'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            },
            'Educação': {
                'termos': ['escola particular', 'colégio particular', 'curso de inglês', 'curso de informática'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            },
            'Imobiliárias': {
                'termos': ['imobiliária', 'corretor de imóveis', 'agência imobiliária'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            },
            'Contabilidade': {
                'termos': ['contador', 'escritório de contabilidade', 'contabilidade'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            }
        }

    def carregar_historico(self):
        """Carrega o histórico de leads já processados"""
        if os.path.exists(self.arquivo_historico):
            try:
                df = pd.read_csv(self.arquivo_historico)
                return set(df['telefone'].dropna().astype(str))
            except Exception as e:
                print(f"Erro ao carregar histórico: {str(e)}")
                return set()
        return set()

    def salvar_historico(self, novos_leads):
        """Salva novos leads no histórico"""
        if not novos_leads:
            return

        # Cria diretório se não existir
        if not os.path.exists('leads'):
            os.makedirs('leads')

        # Prepara dados para salvar
        dados_para_salvar = []
        for lead in novos_leads:
            if lead['telefone'] and lead['telefone'] not in self.leads_historicos:
                dados_para_salvar.append(lead)
                self.leads_historicos.add(lead['telefone'])

        if dados_para_salvar:
            # Se o arquivo já existe, adiciona ao final
            if os.path.exists(self.arquivo_historico):
                df_existente = pd.read_csv(self.arquivo_historico)
                df_novos = pd.DataFrame(dados_para_salvar)
                df_combinado = pd.concat([df_existente, df_novos], ignore_index=True)
            else:
                df_combinado = pd.DataFrame(dados_para_salvar)

            # Salva o arquivo
            df_combinado.to_csv(self.arquivo_historico, index=False, encoding='utf-8-sig')
            print(f"\nAdicionados {len(dados_para_salvar)} novos leads ao histórico")

    def extrair_leads_por_nicho(self, nicho):
        """Extrai leads para um nicho específico"""
        if nicho not in self.nichos:
            print(f"Nicho '{nicho}' não encontrado!")
            return []

        nicho_info = self.nichos[nicho]
        leads_totais = []
        leads_novos = []

        for termo in nicho_info['termos']:
            for area in nicho_info['areas']:
                if self.leads_processados >= self.leads_por_dia:
                    print(f"Limite diário de {self.leads_por_dia} leads atingido!")
                    return leads_totais

                print(f"\nBuscando: {termo} em {area}")
                leads = self.extrair_leads(termo, area)
                
                # Filtra leads já existentes
                for lead in leads:
                    if lead['telefone'] and lead['telefone'] not in self.leads_historicos:
                        leads_novos.append(lead)
                        self.leads_historicos.add(lead['telefone'])
                
                leads_totais.extend(leads_novos)
                self.leads_processados += len(leads_novos)

                # Pausa entre buscas para respeitar limites da API
                time.sleep(2)

        # Salva novos leads no histórico
        self.salvar_historico(leads_novos)
        return leads_totais

    def extrair_leads(self, termo, area):
        """Extrai leads usando a API do Google Places"""
        leads = []
        query = f"{termo} {area}"
        
        try:
            # Busca lugares
            places_result = self.gmaps.places(
                query=query,
                location=None,  # A API vai usar a localização baseada na query
                radius=50000,  # 50km de raio
                language='pt-BR'
            )

            # Processa os resultados
            for place in places_result.get('results', []):
                try:
                    # Obtém detalhes do lugar
                    place_details = self.gmaps.place(
                        place['place_id'],
                        fields=['name', 'formatted_address', 'formatted_phone_number', 'website']
                    )['result']

                    lead = {
                        'nome': place_details.get('name', ''),
                        'telefone': place_details.get('formatted_phone_number', ''),
                        'endereco': place_details.get('formatted_address', ''),
                        'site': place_details.get('website', ''),
                        'nicho': termo,
                        'area': area,
                        'data_extração': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }

                    # Verifica se o telefone tem WhatsApp
                    if lead['telefone']:
                        lead['telefone'] = self.verificar_whatsapp(lead['telefone'])

                    leads.append(lead)

                except Exception as e:
                    print(f"Erro ao processar lugar: {str(e)}")
                    continue

        except Exception as e:
            print(f"Erro na busca: {str(e)}")

        return leads

    def verificar_whatsapp(self, telefone):
        """Formata o número para WhatsApp"""
        if not telefone:
            return None
            
        # Remove caracteres não numéricos
        telefone = ''.join(filter(str.isdigit, telefone))
        
        # Adiciona código do país se necessário
        if len(telefone) == 11:  # DDD + 9 dígitos
            telefone = '55' + telefone
        elif len(telefone) == 10:  # DDD + 8 dígitos
            telefone = '55' + telefone
            
        return telefone

    def gerar_csv(self, leads, nicho):
        """Gera arquivo CSV com os leads"""
        if not leads:
            print("Nenhum lead para gerar CSV!")
            return

        # Cria diretório se não existir
        if not os.path.exists('leads'):
            os.makedirs('leads')

        # Separa leads com e sem WhatsApp
        leads_com_whatsapp = [lead for lead in leads if lead['telefone']]
        leads_sem_whatsapp = [lead for lead in leads if not lead['telefone']]

        # Gera timestamp para o nome do arquivo
        timestamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S-%f")
        
        # Nome do arquivo baseado no nicho
        nome_arquivo = f"leads/{nicho.lower()}_{timestamp}.csv"
        
        # Cria DataFrame e salva CSV
        df = pd.DataFrame(leads_com_whatsapp)
        df.to_csv(nome_arquivo, index=False, encoding='utf-8-sig')
        
        print(f"\nArquivo CSV gerado: {nome_arquivo}")
        print(f"Total de leads: {len(leads)}")
        print(f"Leads com WhatsApp: {len(leads_com_whatsapp)}")
        print(f"Leads sem WhatsApp: {len(leads_sem_whatsapp)}")

    def resetar_contador(self):
        """Reseta o contador de leads processados"""
        self.leads_processados = 0

# Exemplo de uso
if __name__ == "__main__":
    extrator = LeadExtrator()
    try:
        # Testa com alguns nichos
        nichos_teste = ['Advocacia', 'Clínicas', 'Educação']
        for nicho in nichos_teste:
            print(f"\nProcessando nicho: {nicho}")
            leads = extrator.extrair_leads_por_nicho(nicho)
            extrator.gerar_csv(leads, nicho)
            time.sleep(2)  # Pausa entre nichos
    except Exception as e:
        print(f"Erro durante a execução: {str(e)}")