# Hegel — reconstrução com poses de Felipe (22/10/2026)

Modo: ferramenta integrada image_gen, fundo transparente. Foram gerados cinco atlas com quatro figuras cada;17 poses completas foram selecionadas para o jogo. As referências de Felipe orientam poses, câmera e acabamento; a identidade é Hegel maduro, grisalho, cravat branca e sobrecasaca preta.

Arquivos: public/game/hegel-{movement,essentials,specials,reactions,walk}-v2.webp; quadros extraídos em public/game/hegel-poses-v2/. Extração reproduzível: node scripts/extract-hegel-poses.mjs. A extração mantém resolução nativa e bordas alfa de cada silhueta, separando vizinhos que ultrapassam a grade nominal. Nenhuma cabeça é colada no motor. Toda troca de pose redesenha uma figura inteira.

Arena: mesma referência de altura94% do Felipe, proporção isotrópica, âncora corporal X e sola Y por pose. Quadros agachados têm altura natural reduzida. HiDPI mínimo2x, smoothing high, cores sem filtro. Caminhada4 poses/640ms; golpes usam preparação, contato e recuperação; U permanece Espírito do Tempo, contato1480ms.

Validação:66 testes, incluindo combat controller dos dois lados e assets; inspeção visual dos17 quadros e caminhada ao lado de Felipe no Canvas do navegador. A página temporária de revisão é removida antes do build.

Prompts exatos:

## Movement

undefined

## Essentials

undefined

## Specials

undefined

## Reactions

undefined

## Walk

undefined

