# Schopenhauer — acabamento do combate

Os sprites, enquadramentos, dimensões e linha de chão aprovados foram preservados. Os novos visuais são desenhados em Canvas2D em HiDPI; nenhum bitmap foi substituído ou regenerado.

- J/I: contato contínuo do tronco à ponta, incluindo interseção do corpo adversário em distância zero. Mantém o alcance frontal máximo anterior, não acerta adversários completamente atrás.
- Confrontos com Schopenhauer: separação mínima de22 unidades percentuais da arena, corrigida antes dos contatos, inclusive nos limites e em aproximações da CPU. Outros confrontos mantêm18.
- Flash: camada branca recortada pelo alfa do sprite, opacidade24%,80ms reais incluindo hitstop. Desativados os filtros globais brightness5 e brightness1.8 sobre este personagem.
- Bengala: rastro curvo prateado/cinza escuro no Canvas acompanha o arco da ponta; J tem uma passagem e I duas. Espelhamento acompanha a própria imagem e o relógio para durante hitstop.
- U: pêndulo de bronze gravado com corrente, mecanismo circular e lâmina curva. Oscila nas duas direções, alcança o alvo no mesmo1480ms do dano, preserva48 de dano e custo100 de Vontade. Corte escuro no alvo e tremor de6px são disparados pelo callback de dano, nos dois lados, e limpos no reset. Mantém a posição do contato durante o recuo.

Validação:79 testes passaram (contato, pushboxes, controlador real P1/CPU, carga, impacto, reset, efeitos, assets, seleção e História). Inspeção visual no navegador do pêndulo, rastro de J e flash24%; filtros computados do corpo e sprite confirmados como none. Página temporária de revisão removida antes da publicação.
