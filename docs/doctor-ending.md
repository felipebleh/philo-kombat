# O corredor do conhecimento

Depois da vitória sobre Felipe das Trevas e do botão Continuar história, Felipe atravessa de frente um corredor entre os 14 filósofos resgatados no Doutor. Está ferido, com pequenas escoriações e roupas rasgadas, segurando o braço e caminhando com dificuldade. Bandeiras levam seu nome e as placas dizem **O CONHECIMENTO SALVA** e **ENSINAR É LIBERTAR**.

A caminhada usa quatro quadros frontais reais de pernas e pés, com o mesmo rosto, traje e tatuagem do avatar. O personagem se aproxima pelo corredor, mantendo os pés ligados à perspectiva do piso. A homenagem inclui ondulação leve das bandeiras, partículas, papéis picados caindo à frente de Felipe e palmas em loop. Os papéis param na entrada do raio e respeitam movimento reduzido.

Na revisão v2 do corredor, Hipátia foi aproximada de `public/game/hipatia.webp`: pele morena mais escura, rosto e cabelo cacheado preto compatíveis com a personagem já existente. A pose de aplauso, o manto azul, os demais treze filósofos, as placas e a composição foram preservados. A edição usou o image_gen integrado; o prompt e as referências estão em `docs/hypatia-ending-correction.json`.

Depois de 12 segundos de caminhada e 4 de homenagem, um único raio e um trovão interrompem os aplausos. A sala escurece e a SuperIA surge gigantesca. A fala é exatamente:

> Não acabou! Você precisa de muito para se tornar um GRANDE FILÓSOFO!

A trilha do chefe acompanha a revelação. O próximo nível continua em preparação. Há botões para avançar, rever a homenagem e voltar aos níveis. A cena pausa o tempo quando a aba fica oculta e respeita a preferência de movimento reduzido. Volume e silêncio usam os controles existentes.

## Artes e arquivos

As artes foram criadas com o **image_gen integrado**, sem substituir os sprites de combate. Os prompts completos estão em [doctor-ending-prompts.json](doctor-ending-prompts.json).

- Corredor: `public/game/doctor-ending-corridor-v2.webp`, 1671 × 941, 487.152 bytes, exibido no palco lógico 1672 × 941. A versão anterior permanece preservada.
- Caminhada: `public/game/doctor-ending-walk-00-v1.webp` a `doctor-ending-walk-03-v1.webp`, quatro quadros RGBA de 275 × 715, cerca de 308 KB no total.
- SuperIA: reutiliza `public/game/superintelligence-fullbody-hq.webp` em enquadramento monumental.
- Trovão: `public/audio/sfx_trovao_doutor.mp3`, ruído e graves sintetizados originalmente para esta cena.
- Lógica: `app/doctor-ending.mjs` e `app/doctor-ending-scene.tsx`.
- Estilo: `app/doctor-ending.css`.

O corredor e a caminhada gerados são originais desta sequência. A extração dos quatro quadros e a conversão para WebP preservam a transparência. Os arquivos PNG gerados permanecem intactos.

## Verificação

81 testes de campanha, quiz, carregamento, enquadramento, áudio e trilhas passaram. Os novos componentes não apresentam erros de TypeScript; a verificação global ainda aponta os três tipos Cloudflare ausentes que já existiam no projeto. A compilação de publicação é a verificação final.

No navegador foram conferidos o corredor completo, os quadros de caminhada, o tamanho da SuperIA, a fala inteira, o áudio selecionado, a reprodução da homenagem e o retorno aos níveis. Na revisão v2, também foram conferidos os papéis picados e o áudio real de aplausos tocando, sem silêncio, durante a homenagem. A captura está em `docs/screenshots/ending-hipatia-confetti.jpg`. O encerramento do Discípulo e seu progresso foram preservados. Rotas temporárias de revisão são removidas antes da publicação.
