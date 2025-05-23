from enriquecimento_leads import EnriquecimentoLeads
import os

def testar_enriquecimento_transportadoras():
    print("Iniciando teste de enriquecimento de leads de transportadoras...")
    
    enricher = EnriquecimentoLeads()
    
    # Arquivo mais recente de transportadoras
    arquivo_leads = "leads/transportadoras_2025-05-22T13-29-23-284374.csv"
    
    try:
        # Verifica se o arquivo existe
        if not os.path.exists(arquivo_leads):
            print(f"Arquivo não encontrado: {arquivo_leads}")
            return
            
        print(f"\nProcessando arquivo: {arquivo_leads}")
        
        # Processa o arquivo
        leads_enriquecidos = enricher.processar_arquivo_leads(arquivo_leads)
        
        # Salva os resultados
        arquivo_saida = enricher.salvar_leads_enriquecidos(leads_enriquecidos, arquivo_leads)
        
        print(f"\nEnriquecimento concluído!")
        print(f"Arquivo de saída: {arquivo_saida}")
            
    except Exception as e:
        print(f"Erro durante o teste: {str(e)}")
    finally:
        print("\nTeste finalizado!")

if __name__ == "__main__":
    testar_enriquecimento_transportadoras() 