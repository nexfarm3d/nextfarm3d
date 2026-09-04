# Contabilidade Societária e Gerencial

Guia para escrituração, demonstrações e fechamento. Objetivo: contabilidade que serve para três coisas ao mesmo tempo — atender ao fisco, sustentar a distribuição de lucros e apoiar a decisão do sócio.

## Demonstrações e para que cada uma serve

| Demonstração | Regime | Responde |
|---|---|---|
| Balanço Patrimonial | competência | O que a empresa tem, deve e vale (PL) |
| DRE | competência | A operação deu lucro? |
| DFC (fluxo de caixa) | caixa | Onde o dinheiro entrou e saiu (operacional, investimento, financiamento) |
| DMPL / DLPA | competência | Como o patrimônio dos sócios mudou; lucros acumulados e distribuídos |
| Balancete | competência | Fotografia mensal de todas as contas — a ferramenta de trabalho do mês |

Empresa pode ter lucro na DRE e quebrar por caixa. Sempre leia DRE + DFC + posição de dívidas juntos.

## Plano de contas — estrutura mínima

```
1 ATIVO                              2 PASSIVO
1.1 Circulante                       2.1 Circulante
  Caixa e bancos                       Fornecedores
  Aplicações financeiras               Obrigações trabalhistas (salários, férias, 13º, FGTS, INSS)
  Clientes / duplicatas a receber      Obrigações tributárias (a recolher, parcelamentos curto prazo)
  (-) PECLD                            Empréstimos e financiamentos curto prazo
  Estoques                             Adiantamento de clientes
  Impostos a recuperar               2.2 Não circulante
  Adiantamentos                        Empréstimos longo prazo, parcelamentos, provisões
1.2 Não circulante                   2.3 Patrimônio Líquido
  Realizável a longo prazo             Capital social
  Investimentos                        Reservas
  Imobilizado / (-) Depreciação        Lucros ou prejuízos acumulados
  Intangível / (-) Amortização
```

Regra prática: crie conta analítica só quando alguém for olhar aquele número. Plano inchado gera classificação errada; plano curto demais esconde problema.

## Fechamento mensal — o que precisa estar feito

1. Conciliação bancária de todas as contas (saldo contábil = extrato, com partidas em trânsito identificadas).
2. Conciliação de clientes e fornecedores (razão × relatório do sistema).
3. Baixa de estoque / CMV do mês.
4. Provisões de férias e 13º apropriadas mensalmente (1/12 + 1/3 e encargos), não apenas quando pagas.
5. Depreciação e amortização do mês.
6. Apropriação de despesas antecipadas (seguros, softwares anuais) por competência.
7. Impostos do mês provisionados na competência, não no pagamento.
8. Conferência de contas transitórias zeradas e de saldos com natureza invertida.
9. Balancete revisado e comparado com o mês anterior — variação acima de 20% em qualquer conta relevante exige explicação.

## Depreciação — taxas fiscais usuais

| Bem | Taxa anual | Vida útil |
|---|---|---|
| Edificações | 4% | 25 anos |
| Máquinas e equipamentos | 10% | 10 anos |
| Móveis e utensílios | 10% | 10 anos |
| Computadores e periféricos | 20% | 5 anos |
| Veículos | 20% | 5 anos |

Contabilmente vale a vida útil econômica (CPC 27); fiscalmente as taxas acima são as aceitas sem questionamento. Divergência entre as duas gera ajuste no LALUR (Lucro Real).

## Pontos que mais geram problema

- **Conta "empréstimo a sócios" / adiantamentos crescendo mês a mês**: é distribuição disfarçada. Risco de tributação como remuneração (folha + IRRF) e de descaracterizar a isenção dos lucros. Corrigir com pró-labore adequado, distribuição formal ou devolução real.
- **Caixa alto e irreal**: saldo de caixa em dinheiro que ninguém tem na gaveta indica venda sem lastro ou pagamento sem documento. É o primeiro item que fiscalização e banco olham.
- **Estoque que não bate**: diferença entre físico e contábil vira omissão de receita presumida. Inventário ao menos anual, documentado.
- **Despesa pessoal do sócio na empresa**: indedutível, glosável, e contamina o lucro distribuível. Se ocorre, classificar corretamente (conta de sócios) em vez de esconder em "despesas gerais".
- **Falta de segregação entre conta da empresa e conta do sócio**: torna a contabilidade indefensável. Primeira correção estrutural em empresa desorganizada.
- **Lucro distribuído acima do lucro apurado**: o excedente é tributável e pode gerar autuação. Só distribua contra balanço/balancete que comprove o lucro.

## Escrituração e livros obrigatórios

- **ECD (Escrituração Contábil Digital)**: Diário, Razão e balancetes transmitidos via SPED, com balanço e DRE. Obrigatória para Lucro Real e, conforme a regra vigente, para Lucro Presumido que distribui lucros acima da presunção. Prazo usual: até o último dia útil de maio do ano seguinte — confirme o calendário do ano.
- **ECF (Escrituração Contábil Fiscal)**: apuração de IRPJ/CSLL, com LALUR/LACS eletrônico. Prazo usual: último dia útil de julho — confirme.
- **LALUR**: controla adições, exclusões e compensações; obrigatório no Lucro Real.
- **Livro Caixa**: alternativa para Simples/Presumido sem ECD, mas contabilidade completa é sempre a posição mais defensável — inclusive para distribuir lucros isentos.
- **Guarda de documentos**: 5 anos é o mínimo prático para o fisco (prazo decadencial); FGTS e questões previdenciárias/trabalhistas pedem prazos maiores. Regra de bolso segura: fiscal 5 anos, trabalhista/previdenciário 30 anos para documentos de vínculo, societário permanente.

## Contabilidade gerencial — o mínimo que o sócio deve receber todo mês

DRE gerencial (com margem de contribuição separada do custo fixo), posição de caixa e dívidas, contas a receber por faixa de vencimento, contas a pagar dos próximos 30/60/90 dias, e comparativo do mês contra o mesmo mês do ano anterior. Se o escritório só entrega guia de imposto, a empresa está sem informação para decidir.
