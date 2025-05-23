from extrator_leads import LeadExtrator
import time

def testar_transportadoras():
    print("Iniciando extração de leads de transportadoras em Santa Catarina...")
    
    extrator = LeadExtrator()
    try:
        nicho = 'Transportadoras'
        print(f"\nProcessando nicho: {nicho}")
        leads = extrator.extrair_leads_por_nicho(nicho)
        extrator.gerar_csv(leads, nicho)
            
    except Exception as e:
        print(f"Erro durante o teste: {str(e)}")
    finally:
        print("\nTeste finalizado!")

if __name__ == "__main__":
    testar_transportadoras() 