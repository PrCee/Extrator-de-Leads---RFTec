from extrator_leads import LeadExtrator
import time
import traceback

def testar_extracao_maps():
    print("Iniciando teste do extrator de leads do Google Maps...")
    
    try:
        # Instancia o extrator
        print("Inicializando o extrator...")
        extrator = LeadExtrator()
        
        # Testa com um nicho específico
        nicho_teste = 'Escritórios'
        print(f"\nTestando extração para nicho: {nicho_teste}")
        print("=" * 50)
        
        # Extrai leads
        print("Iniciando extração de leads...")
        leads = extrator.extrair_leads_por_nicho(nicho_teste)
        
        if leads:
            print("\n✅ Teste concluído com sucesso!")
            print(f"Total de leads extraídos: {len(leads)}")
            print("\nPrimeiros 3 leads extraídos:")
            for i, lead in enumerate(leads[:3], 1):
                print(f"\nLead {i}:")
                print(f"Nome: {lead.get('nome', 'N/A')}")
                print(f"Endereço: {lead.get('endereco', 'N/A')}")
                print(f"Telefone: {lead.get('telefone', 'N/A')}")
        else:
            print("\n❌ Nenhum lead foi extraído")
            
    except Exception as e:
        print(f"\n❌ Erro durante o teste: {str(e)}")
        print("\nDetalhes do erro:")
        print(traceback.format_exc())
    finally:
        try:
            print("\nFechando o extrator...")
            extrator.fechar()
        except:
            pass

if __name__ == "__main__":
    testar_extracao_maps() 