import pandas as pd
from jucesc_scraper import JUCESCScraper
import os
import time
from datetime import datetime

class LeadEnricher:
    def __init__(self):
        self.jucesc = JUCESCScraper()
        
    def extrair_cnpj_do_endereco(self, endereco):
        """Tenta extrair CNPJ do endereço quando disponível"""
        if not endereco:
            return None
            
        # Procura por padrões de CNPJ no endereço
        import re
        padrao_cnpj = r'\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}'
        match = re.search(padrao_cnpj, endereco)
        if match:
            return match.group(0)
        return None
    
    def processar_arquivo_leads(self, arquivo_leads):
        """Processa um arquivo de leads e enriquece com dados da JUCESC"""
        print(f"Processando arquivo: {arquivo_leads}")
        
        # Lê o arquivo de leads
        df_leads = pd.read_csv(arquivo_leads)
        
        # Lista para armazenar resultados
        leads_enriquecidos = []
        
        # Processa cada lead
        for _, lead in df_leads.iterrows():
            print(f"\nProcessando lead: {lead['nome']}")
            
            # Tenta extrair CNPJ do endereço
            cnpj = self.extrair_cnpj_do_endereco(lead['endereco'])
            
            if cnpj:
                print(f"CNPJ encontrado: {cnpj}")
                # Busca dados na JUCESC
                dados_jucesc = self.jucesc.buscar_empresa(cnpj)
                
                if dados_jucesc:
                    # Combina os dados
                    lead_enriquecido = lead.to_dict()
                    lead_enriquecido.update({
                        'cnpj': cnpj,
                        'razao_social': dados_jucesc.get('razao_social'),
                        'nome_fantasia': dados_jucesc.get('nome_fantasia'),
                        'data_abertura': dados_jucesc.get('data_abertura'),
                        'situacao': dados_jucesc.get('situacao'),
                        'capital_social': dados_jucesc.get('capital_social'),
                        'socios': dados_jucesc.get('socios', [])
                    })
                    leads_enriquecidos.append(lead_enriquecido)
                else:
                    leads_enriquecidos.append(lead.to_dict())
            else:
                print("CNPJ não encontrado no endereço")
                leads_enriquecidos.append(lead.to_dict())
            
            # Pausa para não sobrecarregar o servidor
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
    enricher = LeadEnricher()
    
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