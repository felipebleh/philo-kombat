# Kierkegaard — movimento e especiais

## Resultado

- Os arquivos aprovados de idle, soco J, chute K, retratos e cenário não foram substituídos.
- Novos quadros completos para quatro passos, defesa/agachamento com guarda-chuva e salto com pernas flexionadas, em `public/game/kierkegaard-motion-v2/`.
- `app/kierkegaard-pose-data.ts` define o ponto de ancoragem e uma escala uniforme por imagem. O corpo em pé mantém a altura anterior; os pés usam a mesma linha 1460/1536 do original. Agachar e recolher as pernas muda a postura sem achatar a imagem.
- Canvas com buffer mínimo de 2×, `devicePixelRatio`, suavização de alta qualidade e espaço transparente acima para o salto. Quadros nativos preservados sem reamostragem nos arquivos; a escala de apresentação ocorre apenas no Canvas. A geração não acrescenta detalhe fotográfico ao arquivo original.
- A caminhada substitui a antiga deformação discreta da guarda. Ciclo de quatro poses de 165ms, invertido no recuo.
- I alterna guarda e a imagem de ataque existente em duas estocadas. Os dois cortes opostos seguem o relógio de combate, inclusive durante hitstop.
- U gasta os mesmos 100 pontos, mantém dano 49 e impacto em 1480ms. Impulsão em 200ms, ápice em 840ms, pouso em 1480ms e recuperação em 1850ms. A posição real avança pela arena, respeita limites e separação dos corpos e permanece no destino após o pouso. Não há ator duplicado nem retorno instantâneo à origem.
- A fenda, luz celestial e ondas douradas são desenhadas no Canvas. Tremor de 6px e banner aparecem em contato real. Interrupções cancelam o golpe pendente e a condição aérea. Reset limpa os efeitos.
- L produz espirais violeta/cinza ao redor do alvo. Contato sem defesa impõe 420ms de recuperação e um indicador de desorientação por 600ms de combate. A defesa evita esse atordoamento adicional. Nenhuma inversão de comandos foi adicionada.
- As mesmas regras operam para jogador e CPU; nenhum novo encontro de campanha foi incluído nesta alteração.

## Arquivos de arte

Fontes transparentes: `public/game/kierkegaard-motion-v2/walk-atlas.webp` e `motion-atlas.webp` (1254×1254, WebP lossless). Extrações completas: `walk-a.webp`, `pass-a.webp`, `walk-b.webp`, `pass-b.webp`, `crouch.webp`, `air.webp`, na mesma pasta. São carregadas somente quando Kierkegaard participa da luta; os dois atlas-fonte não integram o preload.

Extração reproduzível: `python3 scripts/extract-kierkegaard-motion.py ATLAS_WALK ATLAS_MOTION`. Separa componentes conectados e conserva antialiasing/alpha e pixels originais, sem trocar rosto ou pintar membros.

## Geração

Modo: ferramenta integrada de geração de imagens, com fundo transparente. Referência principal: `public/game/kierkegaard-guard-frame.webp`. O segundo pedido também recebeu o primeiro atlas como referência de apoio. Os prompts usados foram:

### Atlas de caminhada

> Use case: identity-preserve. Asset: production 2D fighting game animation atlas. Use the supplied Kierkegaard sprite as EXACT identity/costume/photographic quality reference. Create a high resolution 3072x3072 transparent atlas with FOUR separate FULL BODY walking poses of this exact man, in a 2 by 2 grid. Each cell is 1536x1536 with clear transparent gutters. Facing RIGHT three-quarter side in every cell, same head size and torso size and natural perspective. Same swept-up brown hair, recognizable exact face, black cravat, teal waistcoat, black tailcoat with burgundy lining, dark trousers and polished black boots. Carry the SAME CLOSED black umbrella with wooden crook handle in left hand, loose low to left of body. Top left: left boot stepping forward, right heel behind with bent knee. Top right: passing step, right knee coming forward, left leg planted straight. Bottom left: right boot stepping forward, left heel behind with bent knee. Bottom right: passing step left knee coming forward, right leg planted. Legs must visibly articulate differently in every pose, natural fighting walk with subtle arm/umbrella swing and coat tails. Keep hairstyle, facial features, expression, age, outfit colors, lighting and photorealistic detail as reference; no cartoon or stylization. Whole man including hair, both boots and umbrella tip within each cell, generous gutters. No text, no labels, no shadows outside man, no floor, no backdrop. Preserve real transparent alpha.

### Passos intermediários, defesa e salto

> Use case: identity-preserve. Production fighting game sprite atlas, matching the exact man in Image1 and photographic realism. Image2 is a supporting reference for the walking clothes, face and pose scale. Make ONE transparent 2x2 atlas with FOUR distinctly DIFFERENT full body motion frames, NO words. Every man faces RIGHT, identical face/head size, exact swept brown hair and face of Image1, black cravat, teal waistcoat, black long tailcoat/burgundy lining, black trousers and boots, closed black umbrella wooden crook. Upper left: WALK PASSING FRAME, LEFT leg planted straight directly under hips, RIGHT thigh visibly lifted forward with knee bent 80 degrees, right boot off ground, closed umbrella hangs near left hand. Upper right: OPPOSITE WALK PASSING FRAME, RIGHT leg planted under hips, LEFT knee lifted forward with left boot off ground, arm counter-swings. Walk frames MUST have narrow stance, one knee raised like taking a step, NOT a wide stride. Lower left: DEFENSIVE CROUCH, both knees bent deeply, torso lowered, head upright, both hands holding the CLOSED umbrella diagonally across and in FRONT of chest as a blocking barrier; both boots planted. Lower right: JUMP/AIRBORNE TUCK pose, both knees clearly bent and drawn upward, both boots lifted and flexed beneath him, tailcoat flares, closed umbrella raised diagonally, dynamic leap ready to land. Keep exact recognizable face, hair, outfit, neutral lighting and photorealism of original. Maintain same anatomy proportions and same head pixel size across all 4 cells, allowing crouch/tuck to occupy LESS vertical height than the standing frames, not enlarged to fill cell. High native resolution, clean full transparent alpha, every head, boot and umbrella tip completely inside its cell with gutters. No ground, no scene, no silhouettes, no text, no logos.

A ferramenta entregou atlas de 1254×1254; a resolução solicitada no primeiro prompt não é a resolução efetiva do arquivo.

## Validação

100 testes Node de combate, Kierkegaard, assets e campanhas; dois testes de alpha/recorte dos arquivos aprovados; TypeScript focado nos novos módulos. A checagem TypeScript global encontra apenas as declarações preexistentes do ambiente Cloudflare (`cloudflare:workers`, `Fetcher`, `D1Database`), verificadas também pela compilação de produção.

QA visual em rota temporária com componentes reais: caminhada, guarda, pose aérea, abismo, feixe, espirais, cortes e espelhamento para CPU. A rota de revisão é removida antes da publicação.
