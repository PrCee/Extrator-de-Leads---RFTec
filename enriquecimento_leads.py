import pandas as pd
from jucesc_scraper import JUCESCScraper
from linkedin_scraper import LinkedInScraper
import os
import time
from datetime import datetime
import re
from dotenv import load_dotenv

class EnriquecimentoLeads:
    def __init__(self):
        # Carrega variáveis de ambiente
        load_dotenv()
        
        # Verifica credenciais do LinkedIn
        self.linkedin_client_id = os.getenv('LINKEDIN_CLIENT_ID')
        self.linkedin_client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
        
        # Verifica credenciais da JUCESC
        self.jucesc_username = os.getenv('JUCESC_USERNAME')
        self.jucesc_password = os.getenv('JUCESC_PASSWORD')
        
        # Inicializa os scrapers apenas se tiver as credenciais
        self.linkedin = None
        self.jucesc = None
        
        if self.linkedin_client_id and self.linkedin_client_secret:
            print("Credenciais do LinkedIn encontradas!")
            self.linkedin = LinkedInScraper(
                client_id=self.linkedin_client_id,
                client_secret=self.linkedin_client_secret
            )
        else:
            print("Aviso: Credenciais do LinkedIn não encontradas. O enriquecimento com dados do LinkedIn não estará disponível.")
        
        if self.jucesc_username and self.jucesc_password:
            print("Credenciais da JUCESC encontradas!")
            self.jucesc = JUCESCScraper(
                username=self.jucesc_username,
                password=self.jucesc_password
            )
        else:
            print("Aviso: Credenciais da JUCESC não encontradas. O enriquecimento com dados da JUCESC não estará disponível.")
        
    def extrair_cnpj_do_endereco(self, endereco):
        """Tenta extrair CNPJ do endereço quando disponível"""
        if not endereco:
            return None
            
        # Procura por padrões de CNPJ no endereço
        padrao_cnpj = r'\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}'
        match = re.search(padrao_cnpj, endereco)
        if match:
            return match.group(0)
        return None
    
    def limpar_nome_empresa(self, nome):
        """Limpa o nome da empresa para busca"""
        # Remove termos comuns que podem atrapalhar a busca
        termos_remover = ['ltda', 'me', 'epp', 'transportes', 'transportadora', 'logística', 'logistica']
        nome_limpo = nome.lower()
        for termo in termos_remover:
            nome_limpo = nome_limpo.replace(termo, '').strip()
        return nome_limpo
    
    def enriquecer_lead(self, lead):
        """Enriquece um lead com dados da JUCESC e LinkedIn"""
        print(f"\nEnriquecendo lead: {lead['nome']}")
        
        # Tenta extrair CNPJ do endereço
        cnpj = self.extrair_cnpj_do_endereco(lead['endereco'])
        lead_enriquecido = lead.copy()
        
        # Busca dados na JUCESC se tiver CNPJ e credenciais
        if cnpj and self.jucesc:
            print(f"CNPJ encontrado: {cnpj}")
            dados_jucesc = self.jucesc.buscar_empresa(cnpj)
            
            if dados_jucesc:
                lead_enriquecido.update({
                    'cnpj': cnpj,
                    'razao_social': dados_jucesc.get('razao_social'),
                    'nome_fantasia': dados_jucesc.get('nome_fantasia'),
                    'data_abertura': dados_jucesc.get('data_abertura'),
                    'situacao': dados_jucesc.get('situacao'),
                    'capital_social': dados_jucesc.get('capital_social'),
                    'socios': dados_jucesc.get('socios', [])
                })
        
        # Busca dados no LinkedIn se tiver credenciais
        if self.linkedin:
            nome_empresa = self.limpar_nome_empresa(lead['nome'])
            print(f"Buscando no LinkedIn: {nome_empresa}")
            dados_linkedin = self.linkedin.buscar_empresa(nome_empresa)
            
            if dados_linkedin:
                lead_enriquecido.update({
                    'url_linkedin': dados_linkedin.get('url_linkedin'),
                    'funcionarios': dados_linkedin.get('funcionarios'),
                    'setor': dados_linkedin.get('setor'),
                    'funcionarios_chave': dados_linkedin.get('funcionarios_chave', [])
                })
        
        return lead_enriquecido
    
    def processar_arquivo_leads(self, arquivo_leads):
        """Processa um arquivo de leads e enriquece com dados"""
        print(f"Processando arquivo: {arquivo_leads}")
        
        # Lê o arquivo de leads
        df_leads = pd.read_csv(arquivo_leads)
        
        # Lista para armazenar resultados
        leads_enriquecidos = []
        
        # Processa cada lead
        for _, lead in df_leads.iterrows():
            lead_enriquecido = self.enriquecer_lead(lead.to_dict())
            leads_enriquecidos.append(lead_enriquecido)
            
            # Pausa para não sobrecarregar os servidores
            time.sleep(2)
        
        return leads_enriquecidos
    
    def salvar_leads_enriquecidos(self, leads, arquivo_original):
        """Salva os leads enriquecidos em um novo arquivo"""
        # Cria nome do arquivo de saída
        timestamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
        nome_base = os.path.splitext(os.path.basename(arquivo_original))[0]
        arquivo_saida = f"leads/{nome_base}_enriquecido_{timestamp}.csv"
        
        # Converte para DataFrame
        df = pd.DataFrame(leads)
        
        # Salva o arquivo
        df.to_csv(arquivo_saida, index=False, encoding='utf-8-sig')
        print(f"\nLeads enriquecidos salvos em: {arquivo_saida}")
        
        return arquivo_saida

def main():
    enricher = EnriquecimentoLeads()
    
    # Lista todos os arquivos CSV na pasta leads
    pasta_leads = 'leads'
    arquivos_csv = [f for f in os.listdir(pasta_leads) if f.endswith('.csv') and not f.endswith('_enriquecido.csv')]
    
    for arquivo in arquivos_csv:
        caminho_completo = os.path.join(pasta_leads, arquivo)
        print(f"\nProcessando arquivo: {arquivo}")
        
        # Processa o arquivo
        leads_enriquecidos = enricher.processar_arquivo_leads(caminho_completo)
        
        # Salva os resultados
        enricher.salvar_leads_enriquecidos(leads_enriquecidos, caminho_completo)

if __name__ == "__main__":
    main() 