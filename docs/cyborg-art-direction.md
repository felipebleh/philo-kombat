# Felipe das Trevas — primeira versão jogável

Disponível no Modo Versus como **FELIPE DAS TREVAS**, no último card da grade. Pode ser escolhido como jogador ou adversário. Qualquer um dos lados selecionando o clone utiliza a sala distópica.

## Direção visual

O professor continua reconhecível: rosto, cabelo, tatuagem, regata com o emblema da escola e calça xadrez. A nova identidade acrescenta meia face metálica, olho vermelho, um braço mecânico e proteções nos joelhos. O braço mecânico ficou do lado direito de quem vê a arte de referência; esse resultado foi mantido nas demais poses para conservar continuidade. Todas as poses são figuras completas, com membros em posições diferentes. A caminhada usa quatro fases de passo baixo.

A sala mantém a câmera e os elementos da sala original — janela, ar-condicionado, quadros, TV, mesa e carteiras — em uma realidade alternativa com rachaduras, cabos e luz vermelha. A faixa frontal continua livre para o combate.

## Golpes

| Tecla | Golpe | Funcionamento |
| --- | --- | --- |
| J | Soco do Protocolo | Soco com o braço mecânico; mesmo ritmo e dano do Felipe. |
| K | Chute da Supressão | Chute lateral completo, com apoio no piso. |
| I | Execução em Cadeia | Preparação, soco, cruzado, chute e recuperação. |
| L | Certeza Absoluta | Projétil de exclamação; consome 100 Controle, impacto aos 1180 ms. |
| U | Enxame de Controle | Três drones, explosões no alvo e tremor de 6 px; consome 100 Controle, impacto aos 1480 ms. |

Os efeitos usam o relógio do combate e congelam com o hitstop. O impacto fixa a posição antes do recuo do alvo. Interrupção e reset cancelam efeitos pendentes. A sequência de ataque reinicia a animação mesmo quando dois socos consecutivos usam o mesmo estado. A soltura das teclas de caminhada retorna à guarda, sem interferir nos ataques.

O clone tem retrato, corpo inteiro na apresentação, pose de vitória, diálogo próprio com Felipe, barra de Controle e a trilha de chefe já existente. O elenco original e a campanha Doutor foram preservados. A transição narrativa pós-Freud, a publicidade do livro e o QR Code serão tratados na etapa da história.

## Arquivos finais

- `public/game/cyborg-v1/idle.webp`
- `public/game/cyborg-v1/walk0.webp` a `walk3.webp`
- `public/game/cyborg-v1/windup.webp`, `punch.webp`, `kick.webp`, `hook.webp`
- `public/game/cyborg-v1/guard.webp`, `jump.webp`, `cast.webp`, `hit.webp`
- `public/game/cyborg-v1/fallen.webp`, `rise.webp`, `victory.webp`, `charge.webp`
- `public/game/thumb-felipe-cyborg.webp`
- `public/game/cyborg-drone-v1.webp`
- `public/game/arena-felipe-dystopia-v1.webp`

As artes foram geradas com a ferramenta integrada **image_gen**, a partir das referências reais do projeto. Os prompts completos estão em `cyborg-master-and-arena-prompts.json` e `cyborg-generation-prompts.json`, nesta pasta. Foram preservados os canais alfa; as folhas foram separadas por silhueta conectada para impedir vazamento de vizinhos. Soco, chute e cruzado receberam artes individuais novas para preservar integralmente mãos e pés. Nenhuma arte anterior do Felipe foi sobrescrita.

## Verificação

135 testes passaram: controlador real de P1/CPU, recursos, dano e recuperação, reset, seleção em uma última linha parcial, carregamento dos assets, música e regressões de história/Freud/Kierkegaard/Hegel/Schopenhauer. Os módulos novos passaram na compilação TypeScript. A conferência no navegador incluiu seleção P2, diálogo, luta real, escala, caminhada, chute, exclamação e voo/explosões dos drones. A verificação TypeScript global ainda aponta apenas os tipos Cloudflare ausentes que já existiam em `db/index.ts` e `worker/index.ts`.
