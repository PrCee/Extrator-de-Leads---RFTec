from enriquecimento_leads import EnriquecimentoLeads
import time

def testar_enriquecimento():
    print("Iniciando teste de enriquecimento de leads...")
    
    enricher = EnriquecimentoLeads()
    
    # Lista de leads de teste
    leads_teste = [
        {
            'nome': 'Transportadora Teste 1',
            'telefone': '5511999999999',
            'endereco': 'Rua Teste, 123 - CNPJ: 12.345.678/0001-99',
            'site': 'http://www.teste1.com.br',
            'nicho': 'Transportadoras',
            'area': 'Florianópolis'
        },
        {
            'nome': 'Transportadora Teste 2',
            'telefone': '5511988888888',
            'endereco': 'Av. Teste, 456 - CNPJ: 98.765.432/0001-99',
            'site': 'http://www.teste2.com.br',
            'nicho': 'Transportadoras',
            'area': 'Joinville'
        }
    ]
    
    try:
        # Processa cada lead
        leads_enriquecidos = []
        for lead in leads_teste:
            print(f"\nProcessando lead: {lead['nome']}")
            lead_enriquecido = enricher.enriquecer_lead(lead)
            leads_enriquecidos.append(lead_enriquecido)
            time.sleep(2)  # Pausa entre leads
        
        # Salva os resultados
        enricher.salvar_leads_enriquecidos(leads_enriquecidos, "leads/teste_enriquecimento.csv")
            
    except Exception as e:
        print(f"Erro durante o teste: {str(e)}")
    finally:
        print("\nTeste finalizado!")

if __name__ == "__main__":
    testar_enriquecimento() 