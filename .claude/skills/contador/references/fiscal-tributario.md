# Fiscal e Tributário

Guia de apuração, obrigações e planejamento. Sempre confirme alíquotas, limites e prazos vigentes antes de o usuário agir — este guia dá a estrutura e a ordem de grandeza, não a tabela oficial do ano.

## Regimes tributários

### Simples Nacional
- Guia única (DAS) reunindo IRPJ, CSLL, PIS, COFINS, IPI, CPP (INSS patronal), ICMS e ISS.
- Limite de receita bruta em 12 meses da ordem de R$ 4,8 milhões (sublimite estadual em torno de R$ 3,6 mi para ICMS/ISS — acima disso, esses dois passam a ser recolhidos fora do DAS). **Confirmar valores vigentes.**
- Anexos I (comércio), II (indústria), III e V (serviços), IV (construção/limpeza/vigilância — CPP fora do DAS, recolhida à parte).
- **Fator R** = (folha + pró-labore + encargos dos últimos 12 meses) ÷ receita bruta dos últimos 12 meses. ≥ 28% → Anexo III (mais barato); < 28% → Anexo V. Aumentar pró-labore para cruzar os 28% é planejamento legítimo e frequentemente compensa — sempre simule, porque o pró-labore traz INSS e IRRF.
- Alíquota efetiva = (RBT12 × alíquota nominal − parcela a deduzir) ÷ RBT12. Nunca use a alíquota nominal como se fosse a real.
- Opção pelo regime: janeiro (até o último dia útil). Exclusão por excesso de receita: se o excesso for até 20%, vale a partir do ano seguinte; acima de 20%, efeito imediato no mês seguinte.

### Lucro Presumido
- Base de IRPJ/CSLL por presunção sobre a receita: 8% (comércio/indústria) e 32% (serviços em geral) para IRPJ; 12% e 32% para CSLL. Revenda de combustíveis 1,6%; transporte de cargas 8%; demais transportes 16%.
- IRPJ 15% sobre a base + adicional de 10% sobre o que exceder R$ 20.000/mês (R$ 60.000/trimestre). CSLL 9%.
- PIS/COFINS cumulativos: 0,65% e 3% sobre a receita, sem crédito.
- Apuração trimestral de IRPJ/CSLL; PIS/COFINS e retenções mensais.
- Vantajoso quando a margem real é maior que a presumida e há pouca despesa creditável.

### Lucro Real
- IRPJ/CSLL sobre o lucro contábil ajustado (adições, exclusões, compensação de prejuízo limitada a 30% do lucro do período).
- PIS/COFINS não cumulativos: 1,65% e 7,6%, com créditos sobre insumos, energia, aluguel PJ, depreciação, fretes etc.
- Obrigatório acima de R$ 78 milhões de receita anual, para bancos/financeiras e em outras hipóteses legais; opcional para os demais.
- Indicado para margem baixa, prejuízo, exportação, ou empresa com muita despesa creditável.

### MEI
- Limite de receita da ordem de R$ 81 mil/ano (**confirmar — há alterações em discussão**), um empregado, atividades permitidas em lista fechada, DAS fixo mensal, DASN-SIMEI anual. Não serve para empresa com estrutura; estourar o limite gera desenquadramento retroativo e cobrança pelo Simples.

## Comparativo de regimes — como fazer direito

Nunca responda "qual é melhor" sem: receita dos últimos 12 meses mês a mês, folha + pró-labore, CMV/custo de serviço, despesas creditáveis, anexo/CNAE e estado/município. Monte planilha com os três regimes lado a lado, carga total anual em R$ e em % da receita, incluindo ICMS/ISS por fora quando aplicável. Decisão é anual e com efeito no exercício seguinte — simule em outubro/novembro.

## Reforma tributária (EC 132/2023 e LC 214/2025) — o que já importa

- **CBS** (federal, substitui PIS/COFINS) e **IBS** (estadual/municipal, substitui ICMS e ISS), mais o **Imposto Seletivo**. Modelo IVA: não cumulativo amplo, crédito financeiro, cobrança no destino.
- **2026**: ano de teste, com alíquotas simbólicas (CBS 0,9% e IBS 0,1%) e obrigação de destacar em documento fiscal, geralmente compensáveis/dispensadas conforme a regra do período.
- **2027**: CBS substitui PIS/COFINS; **2029–2032**: transição gradual do ICMS/ISS para o IBS; **2033**: modelo pleno.
- Impactos práticos a antecipar: atualização do ERP e do layout de NF-e/NFS-e, revisão de precificação (o imposto passa a ser "por fora" e o crédito muda a margem real), revisão de contratos de longo prazo com cláusula tributária, e reavaliação de benefícios fiscais estaduais que perdem efeito na transição.
- **Sempre confirme a regra vigente do período** antes de orientar — este é o tema com maior taxa de mudança no momento.

## Tributos indiretos — pontos práticos

- **ICMS**: estadual, não cumulativo. Atenção a **substituição tributária (ST)** — o imposto é recolhido na origem por toda a cadeia; quem revende mercadoria com ST não credita nem debita, e errar isso gera pagamento em duplicidade. **DIFAL** nas vendas interestaduais a consumidor final. Benefícios e pautas variam por estado: confirmar na legislação do estado (em RO, no RICMS/RO).
- **ISS**: municipal, 2% a 5%, devido em regra no município do prestador, com exceções da LC 116 (construção civil, limpeza, vigilância etc. — no local da prestação). Verificar cadastro e alíquota no município.
- **IPI**: só indústria e importação, por NCM na TIPI.

## Retenções (o que mais gera erro)

| Situação | Retenção típica |
|---|---|
| Serviço PJ→PJ (LC 116 lista de retenção) | ISS conforme o município |
| Serviço PJ→PJ profissional (limpeza, vigilância, consultoria, TI...) | IRRF 1% ou 1,5% conforme o serviço |
| Serviços com cessão de mão de obra / empreitada | INSS 11% sobre a nota (retenção previdenciária) |
| PIS/COFINS/CSLL sobre serviços entre PJ | 4,65% (CSRF), com regras de dispensa por valor |
| Pagamento a pessoa física autônoma | INSS 11% (até o teto) + IRRF pela tabela progressiva + ISS conforme o município |
| Órgão público pagador | Retenções específicas, geralmente maiores |

Empresa do Simples em regra não sofre retenção de IRRF/CSRF sobre serviços, mas sofre retenção de ISS e, nos serviços do Anexo IV com cessão de mão de obra, de INSS. Declare a condição na nota.

## Obrigações acessórias — mapa mensal/anual

| Obrigação | Quem | Periodicidade |
|---|---|---|
| DAS | Simples | Mensal (dia 20) |
| PGDAS-D | Simples | Mensal |
| DEFIS / DASN-SIMEI | Simples / MEI | Anual |
| DCTFWeb | Geral | Mensal (encargos da folha) |
| eSocial | Geral com folha | Por evento / mensal |
| EFD-Reinf | Geral | Mensal (retenções e serviços tomados) |
| EFD-Contribuições | Presumido e Real | Mensal |
| EFD ICMS/IPI (SPED Fiscal) | Contribuintes de ICMS/IPI | Mensal |
| ECD / ECF | Conforme regime | Anual |
| DIRF | Em extinção, absorvida pelo eSocial/Reinf | Confirmar vigência |
| DIMOB, DMED, DECRED | Atividades específicas | Anual |

**Confirme os vencimentos do ano corrente** — mudam por ato normativo e por antecipação de feriado.

## Planejamento tributário: o que funciona e o que não funciona

**Funciona (elisão legítima, com lastro):**
- Escolha e revisão anual do regime com simulação documentada.
- Gestão do fator R no Simples (calibrar pró-labore).
- Aproveitamento correto de créditos de PIS/COFINS no Lucro Real (mapear insumos com laudo/descritivo).
- Segregação de atividades em CNPJs distintos **quando há substância real**: estrutura, equipe, contrato, faturamento e risco próprios.
- Revisão de NCM/CST/CFOP e de mercadorias em ST — recuperação de imposto pago a maior é dinheiro em cima da mesa.
- Recuperação de créditos previdenciários sobre verbas indenizatórias e revisão de retenções pagas indevidamente, dentro do prazo de 5 anos.
- Aproveitamento de prejuízo fiscal e base negativa (limite de 30%).
- Parcelamentos e transações tributárias quando o passivo já existe — melhor negociar cedo que acumular multa e ficar sem certidão.

**Não funciona (ou funciona até a primeira fiscalização):**
- Abrir várias empresas apenas para não estourar o limite do Simples, com mesmos sócios, mesmo endereço, mesma equipe e mesmo cliente → desconsideração da personalidade jurídica e cobrança consolidada com multa qualificada.
- "Pejotizar" empregado que tem pessoalidade, habitualidade, subordinação e onerosidade → passivo trabalhista + previdenciário.
- Nota fria, nota de favor, ou compra de crédito de terceiro → crime tributário, não planejamento.
- Distribuir lucro sem lucro contábil apurado.
- Deixar despesa pessoal do sócio como despesa da empresa.
- Emitir tudo como "serviço" para fugir de ICMS quando a operação é venda de mercadoria (ou o inverso).
- Adiar entrega de obrigação acessória "porque não tem movimento" — a multa por atraso vem mesmo com valor zero.
