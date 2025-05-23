from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from extrator_leads import LeadExtrator
from enriquecimento_leads import EnriquecimentoLeads
import pandas as pd
import os

app = FastAPI()

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class Lead(BaseModel):
    nome: str
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    site: Optional[str] = None
    nicho: str
    area: str

class BuscaConfig(BaseModel):
    areas: List[str]
    nicho: str

# Instâncias globais
extrator = LeadExtrator()
enricher = EnriquecimentoLeads()

@app.get("/api/leads")
async def get_leads():
    try:
        # Lê o arquivo mais recente de leads
        pasta_leads = 'leads'
        arquivos = [f for f in os.listdir(pasta_leads) if f.endswith('.csv')]
        if not arquivos:
            return []
            
        arquivo_mais_recente = max(arquivos, key=lambda x: os.path.getctime(os.path.join(pasta_leads, x)))
        df = pd.read_csv(os.path.join(pasta_leads, arquivo_mais_recente))
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/leads/buscar")
async def buscar_leads(config: BuscaConfig):
    try:
        leads = extrator.extrair_leads_por_nicho(config.nicho)
        extrator.gerar_csv(leads, config.nicho)
        return {"message": "Busca concluída com sucesso", "leads": leads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/leads/enriquecer")
async def enriquecer_leads():
    try:
        # Processa o arquivo mais recente
        pasta_leads = 'leads'
        arquivos = [f for f in os.listdir(pasta_leads) if f.endswith('.csv') and not f.endswith('_enriquecido.csv')]
        if not arquivos:
            raise HTTPException(status_code=404, detail="Nenhum arquivo de leads encontrado")
            
        arquivo_mais_recente = max(arquivos, key=lambda x: os.path.getctime(os.path.join(pasta_leads, x)))
        leads_enriquecidos = enricher.processar_arquivo_leads(os.path.join(pasta_leads, arquivo_mais_recente))
        arquivo_saida = enricher.salvar_leads_enriquecidos(leads_enriquecidos, os.path.join(pasta_leads, arquivo_mais_recente))
        
        return {"message": "Enriquecimento concluído", "arquivo": arquivo_saida}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 