# Freud — acabamento de combate

A arte e os ciclos existentes de caminhada, guarda, soco, chute e combo permanecem. A escala da camada visual e a geometria de contato usam 1.10, com pivô nas solas; os ataques em imagens individuais compensam a margem transparente inferior de 50/1536. A sombra permanece no solo e contrai durante o salto.

O flash usa uma matriz SVG em sRGB equivalente a sobrepor branco com alfa 0.35, conservando o alfa original de cada pixel. Aplica-se aos dois lutadores nas lutas com Freud. As demais combinações preservam seus efeitos anteriores.

Fumaça, sonhos e energia são desenhados no Canvas com densidade mínima 2x e usam o relógio do combate, incluindo hitstop. A fumaça acompanha a camada animada e o espelhamento do personagem. Os sonhos orbitam a posição atual do alvo. O golpe L causa torpor somente em contato sem defesa: velocidade de caminhada e de animação de salto reduzida pela metade durante 500 ms de combate, sem acumular com a contenção de Hobbes. Reset e saída da luta limpam o estado.

A onda dupla de U chega ao alvo aos 1480 ms, no mesmo callback que aplica o dano. O impacto ancora a posição, produz clarão e tremor de 6 px. O escurecimento de 40% fica atrás dos lutadores. Os custos de 100 Libido e os valores e tempos de dano foram preservados.

Validação: 58 testes de combate/geometria/efeitos, 58 testes de regressão de história, seleção, assets e personagens próximos; compilação TypeScript dos módulos novos. Revisão no navegador: escala e chão, flash em Freud/Felipe, fumaça no soco espelhado, névoa com relógio/chave/divã e onda em ambas as direções, além do enquadramento pré-luta no consultório.
