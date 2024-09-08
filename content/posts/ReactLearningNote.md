+++
title = 'ReactLearningNote'
date = '2024-08-25T17:03:17+09:00'
draft = true
+++

### 経緯

codesandboxで生成したReactプロジェクトがpnpmを使用していた。  
npmとの違いが何か？なぜ採用されているか？気になったので調べた

### 概要

pnpmは、JavaScriptのパッケージマネージャーの一つ。  
npmとの違いは主に3つ

**1. 効率的なストレージ**  
パッケージを一度だけストアし、それをハードリンクとシンボリックリンクで使用し、プロジェクトとリンクする
それにより、ディスクスペースの使用が削減され、効率的にストレージを使用できる  

**2. 厳格なパッケージ分離**  
パッケージが宣言していない依存関係の発生を防ぐ事ができる。
`node_modules`ディレクトリをフラットに保つかわりに、各パッケージを独自の`node_modules`ディレクトリに分離する。  

**3. パフォーマンス**  
並列処理とオプションのオフラインモードを使用して、パフォーマンス向上が可能

### 所感と所感

- pnpmのpってなんだろう？おそらくpに込められた意味が端的にnpmをの違いを表すコンセプトのはず。
  - `pnpm`の`p`は "performant"（高性能）を意味するらしい。
  
- ストレージの使用は気になっていた。これは良いと思った  
しかし、実態は、どこに保存されるのだろうか？

## StrictMode

reactのsyntaxの強制
厳密なルールに従っているかチェックしてくれる
コンポーネント名がパスカルケースになっているか？  
OK: App
NG: app  

## TIPSなど

### 1. Propsの書き方

関数コンポーネントでオブジェクト形式のpropsを受け取、そのプロパティを頻繁に使用する場合、  
でストラクチャリング（分割代入）を活用すると良い。  
コードがスッキリし、可読性が向上する。

```javascript
export const ColorfulMessage = (props) => {
  const { color, children } = props;
  const contentStyleA = {
    color: color,
    fontSize:  "18px"
  }
  
  return <p style={contentStyleA}>{children}</p>
};
```

## 2. 再レンダリング

ReactはdevモードかつStrictModeだと、2回レンダリングするらしい

### useEffect

useEffect(setup, dependencies?) 
[Document](https://ja.react.dev/reference/react/useEffect)
useEffect はフックであるため、コンポーネントのトップレベルやカスタムフック内でのみ呼び出すことができます。  
ループや条件文の中で呼び出すことはできません。これが必要な場合は、新しいコンポーネントを抽出し、その中に state を移動させてください。

- 基本的には多用するものではないらしい。

## named export vs default export

import した時に、自由に名前を付けられる
default exportはひとつのファイルで一つの

## Named Export

- 複数の値をエクスポートできる
- exportとimportで名前を一致させる必要がある
- {}を使用してインポートする

```JavaScript
export const num = 1;
export function printNum() {
  console.log(num);
}
```

```JavaScript
import {num, printNum} from './module.js';
```

## Default Export

- ファイルごとに１つ値のみをエクスポートする
- exportとimportで名前を一致させる必要がない
- {}を使用せずインポートする

```JavaScript
const myFunction = () => {
  console.log("Hello!");
};
export default myFunction
```

```JavaScript
import anyNameYouLike from './module.js';

anyNameYouLike();
```
