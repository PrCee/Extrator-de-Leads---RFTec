from extrator_leads import LeadExtrator
import time

def testar_extrator():
    print("Iniciando teste do extrator de leads...")
    
    # Áreas de busca
    areas = ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
    print(f"Áreas configuradas: {', '.join(areas)}")
    
    # Nichos para teste
    nichos = ['Advocacia', 'Clínicas', 'Educação', 'Imobiliárias', 'Contabilidade']
    
    extrator = LeadExtrator()
    try:
        for nicho in nichos:
            print(f"\nTestando extração para nicho: {nicho}")
            leads = extrator.extrair_leads_por_nicho(nicho)
            extrator.gerar_csv(leads, nicho)
            time.sleep(2)  # Pausa entre nichos
            
    except Exception as e:
        print(f"Erro durante o teste: {str(e)}")
    finally:
        extrator.fechar()
        print("\nTeste finalizado!")

if __name__ == "__main__":
    testar_extrator()