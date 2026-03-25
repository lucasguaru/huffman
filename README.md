# Huffman Visual Lab

Uma aplicação web interativa (React + Vite) para **visualizar o algoritmo de Huffman** de forma didática, passo a passo, com animações suaves e um visual moderno.

## O que você consegue ver

- **Frequência** de cada caractere (incluindo espaço como `␠`)
- **Fila de prioridade / floresta** ordenada por frequência
- **Seleção dos dois menores** e **combinação** em um nó pai
- **Construção da árvore** binária (SVG)
  - arestas com `0` (esquerda) e `1` (direita)
- **Tabela final** com caractere, frequência e código
- **Texto codificado** (bits) + comparação didática de bits (ASCII vs Huffman)

## Requisitos

- Node.js (recomendado: 18+)

## Rodando localmente

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal.

## Build

```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages

Este projeto já vem com:

- `vite.config.js` com `base: '/huffman/'` (ajuste para o nome do seu repositório)
- scripts `predeploy` e `deploy` usando `gh-pages` via `npx` (sem dependência fixa)

### Passo a passo (método gh-pages via `npx`)

1. Ajuste o `base` em `vite.config.js`:
   - repo `SEU_USUARIO/huffman` → `base: '/huffman/'`
   - repo `SEU_USUARIO/meu-projeto` → `base: '/meu-projeto/'`
2. Faça commit/push do projeto.
3. Rode:

```bash
npm run deploy
```

4. No GitHub, vá em **Settings → Pages** e selecione a branch `gh-pages`.

## Estrutura de pastas

```txt
src/
  App.jsx
  components/
    ControlsPanel.jsx
    StepInfo.jsx
    FrequencyView.jsx
    QueueView.jsx
    TreeView.jsx
    CodesTable.jsx
    EncodedResult.jsx
  lib/
    huffman.js
  styles/
    global.css
```

## Como a animação funciona (modelagem dos steps)

A lógica fica isolada em `src/lib/huffman.js`.

`buildHuffmanSteps(text)` retorna `{ steps }`, onde cada `step` contém:

- `frequencies`: mapa `{ caractere: frequência }`
- `queue`: lista ordenada de nós atuais
- `selectedIds`: ids dos dois nós escolhidos
- `created`: info do nó pai recém-criado
- `nodesById` + `rootId`: dados suficientes para desenhar a árvore no SVG
- `title`, `description`, `kind`: texto didático para a UI
- `result` (nos steps finais): `codes` e `encodedText`

Isso deixa a camada visual bem simples: ela só “renderiza o estado do step”.
