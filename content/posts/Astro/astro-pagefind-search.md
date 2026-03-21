---
title: "PagefindでAstroブログに全文検索を導入した"
date: "2026-03-21T16:00:00+09:00"
draft: false
tags: [astro, pagefind, react, 全文検索]
description: "astro-pagefindの導入手順と、Pagefind UIを使わずにAPIから直接カスタム検索UIを構築した過程を紹介します。"
---

PagefindでAstroブログに全文検索を導入しました。

この記事を読むと、以下のことがわかります。

- astro-pagefindを使用してAstroアプリケーションにPagefindを導入する方法
- Pagefind UIを使わずにAPIで検索UIをカスタム構築する方法
- `⌘K`コマンドパレット型の検索UIの実装

## 背景

ブログに検索ページはあったのですが、雑に作ったまま放置していました。ポートフォリオも兼ねたブログなので、検索機能もちゃんとしたいと思い、機能とデザインを見直しました。

その過程を記事にまとめます。

## Pagefindとは

<https://pagefind.app/>

Pagefindは、Rust製の静的サイト向け全文検索ライブラリです。
特徴は**ビルド時にHTMLをクロールしてインデックスを生成する**点にあります。

開発元は[CloudCannon](https://cloudcannon.com/)で、静的サイト向けCMSを提供している企業です。GitHubリポジトリも継続的に更新されています。

公式サイトでは次のように説明されています。

> Pagefind is a fully static search library that aims to perform well on large sites, while using as little of your users' bandwidth as possible, and without hosting any infrastructure.

公式によると、10,000ページのサイトでもPagefindライブラリ自体を含めてネットワークペイロードが300KB未満に収まるとのことです[^1]。


## なぜPagefindを選んだか

静的サイトに全文検索を導入する方法はいくつかあります。

| ライブラリ / サービス | 方式          | 特徴                             |
|--------------|---------------|----------------------------------|
| Algolia      | 外部SaaS      | 高機能だが外部サービスへの依存が発生する    |
| Fuse.js      | クライアントサイド     | 全記事データをクライアントに読み込む必要がある   |
| Lunr.js      | クライアントサイド     | Fuse.jsと同様、インデックスをクライアントで生成  |
| **Pagefind** | **ビルド時生成** | **ビルド時にHTMLをクロールしてインデックスを生成** |

下記の理由から、Pagefindを採用しました。

- 外部サービスへの依存がない（Algoliaと違い、セルフホスト不要）
- クライアント側で全記事データを読み込む必要がない（Fuse.js/Lunr.jsと違い、軽量）
- ビルド時にインデックスを生成するため、記事数が増えてもクライアントの初期ロードが重くならない

### 余談: Pagefindの人気度

Pagefindは2022年に公開され、上記の比較対象ライブラリと比べると新しいライブラリです。
npm trendsで他のライブラリと比較すると、ダウンロード数ではFuse.jsやLunr.jsにはまだまだ及んでいませんが、GitHub Starsは5,000を超えており、伸びている印象です。

<https://npmtrends.com/algoliasearch-vs-fuse.js-vs-lunr-vs-pagefind>

## astro-pagefindの導入

Astroへの導入はastro-pagefindというインテグレーションを使います。やることはほぼ2つだけです。

<https://github.com/shishkin/astro-pagefind>

### 1. インストール

お使いのパッケージマネージャでインストールします。私の環境ではpnpmを使いました。

```bash
# npm
npm install astro-pagefind

# pnpm
pnpm add astro-pagefind
```

### 2. astro.config.mjsにインテグレーションを追加

```javascript
import pagefind from "astro-pagefind";

export default defineConfig({
  integrations: [react(), sitemap(), pagefind()],
});
```

これだけでビルド時にPagefindのインデックスが自動生成されます。`pagefind()`にオプションを渡す必要もありません。ビルドを実行すると、`dist/pagefind/`配下に`pagefind.js`などのファイルが出力されます。

> [!note] 開発サーバーでは動作しない
> Pagefindはビルド後のHTMLをクロールしてインデックスを作るため、開発サーバーでは検索が動きません。検索を試すにはビルド後にプレビューサーバーで確認します。

### 3. 検索UIの表示

astro-pagefindにはデフォルトのUIコンポーネントも用意されています。

```astro
---
import Search from "astro-pagefind/components/Search";
---

<Search id="search" className="pagefind-ui" uiOptions={{ showImages: false }} />
```

このコンポーネントを配置するだけで、Pagefind UIベースの検索フォームが表示されます。私のブログでも最初はこの方式を使っていました。

## Pagefind UIからカスタムUIへ

### なぜ切り替えたか

Pagefind UIは内部的にSvelteで構築されており[^2]、独自のスコープ付きCSSを持っています。私のブログではTailwind CSS + CSS変数でデザインシステムを構築しているため、**Pagefind UIが既存のデザインシステムにそのまま適合しない**という問題がありました。

具体的には:

- フォントサイズやパディングがサイト全体のデザイントークンと合わない
- CSSの上書きで対応しようとすると、Pagefind UIの内部構造に依存するセレクタが必要になる

以下は、Pagefind UIを使っていた頃と、カスタムUIに切り替えた後の検索ページの比較です。

![Pagefind UIを使っていた頃の検索ページ](/images/posts/astro-pagefind-search/search-pagefind-ui.png)
*Before: Pagefind UIのデフォルトコンポーネント*

![カスタムUIの検索ページ](/images/posts/astro-pagefind-search/search-custom-ui.png)
*After: Pagefind APIで構築したカスタムUI*

CSSの上書きでカスタマイズするよりも、自前でUIを作った方がデザインの自由度が高く、結果的にシンプルだと判断しました。

そこで、Pagefind APIを直接使ってUIを自前で構築することにしました。

### Pagefind UIとPagefind APIの違い

Pagefindには2つの利用方法が用意されています。

|              | Pagefind UI (`pagefind-ui.js`) | Pagefind API (`pagefind.js`) |
|--------------|--------------------------------|------------------------------|
| **提供するもの** | 検索フォーム + 結果表示のUI一式     | 検索APIのみ                    |
| **カスタマイズ性** | UIオプションでの調整                  | 完全に自由                    |
| **CSS**      | Svelte scoped CSS付き           | なし                           |
| **適する場面** | サクッと導入したいとき                  | デザインシステムに合わせたいとき            |

## Pagefind APIでSearchBoxを作る

Pagefind APIのインターフェースはシンプルで、`import`して`search()`を呼ぶだけです。

Pagefindの`.js`ファイルはビルド後に生成されるため、通常の`import`文ではなく動的`import()`で読み込みます。

```typescript
// Pagefindをロード（ビルド後に生成されるファイルなので動的importを使う）
const pagefindPath = "/pagefind/pagefind.js";
const pf = await import(/* @vite-ignore */ pagefindPath);
await pf.init();

// 検索を実行
const response = await pf.search("astro");

// 各結果のデータを取得（遅延ロード）
const data = await response.results[0].data();
console.log(data.url);        // "/posts/astro/..."
console.log(data.meta.title); // "記事タイトル"
console.log(data.excerpt);    // "...検索キーワードの<mark>ハイライト</mark>..."
```

`search()`の結果には`data()`という関数が入っています。これを呼ぶまで詳細データは取得されません。大量の検索結果がある場合でも、表示する分だけ`data()`を呼べばよい設計になっています。

`search()`と`data()`だけで検索機能が実装できるので、APIとしてはかなりシンプルだと感じました。

### SearchBoxコンポーネントの実装

この仕組みを使って、`/search`ページ用のReactコンポーネントを作りました。Pagefindの公式ドキュメントでも動的importによる読み込みが推奨されています[^3]。

```tsx
export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const pagefindRef = useRef<Pagefind | null>(null);
  const allResultsRef = useRef<PagefindResult[]>([]);

  // 初期化: Pagefindをロード + URLパラメータから検索クエリを復元
  useEffect(() => {
    async function loadPagefind() {
      const pagefindPath = "/pagefind/pagefind.js";
      const pf = await import(/* @vite-ignore */ pagefindPath);
      await pf.init();
      pagefindRef.current = pf;

      // ?q=keyword で直接検索できるようにする
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        setQuery(q);
        performSearch(pf, q);
      }
    }
    loadPagefind();
  }, []);

  // 検索実行: 最初の5件だけdata()を呼ぶ
  const performSearch = useCallback(async (pf: Pagefind, searchQuery: string) => {
    const response = await pf.search(searchQuery);
    allResultsRef.current = response.results;

    const loaded = await Promise.all(
      response.results.slice(0, 5).map((r) => r.data()),
    );
    setResults(loaded.map((d) => ({
      url: d.url,
      title: d.meta.title,
      excerpt: d.excerpt,
    })));
  }, []);

  // ...（入力ハンドラ、もっと見る、UI部分）
}
```

ポイントは以下の2つです。

1. **遅延ロード**: `allResultsRef`に全結果を保持し、「もっと見る」で追加分の`data()`を呼びます
2. **URLパラメータ対応**: `?q=keyword`で直接検索結果ページにアクセスできます

> [!note] `/* @vite-ignore */` について
> Pagefindの`.js`ファイルはビルド後に生成されるため、Viteのビルド時には存在しません。`/* @vite-ignore */`を付けることで、Viteがこのimportパスを静的解析しようとしてエラーになるのを防ぎます[^4]。同様の理由で、開発サーバーでは`import()`が失敗するため`try/catch`で囲んでおく必要があります。

ビルド後にプレビューサーバーで実際に検索してみると、結果がほぼ一瞬で返ってきます。個人ブログの記事数であればレスポンスの遅さを感じることはまずないと思います。

以下はカスタムUIで構築した検索ページです。


## ⌘Kコマンドパレットの実装

SearchBoxとは別に、どのページからでも呼び出せるコマンドパレット型の検索UIも作りました。GitHubやVercelのダッシュボードなど、最近のWebアプリでは`⌘K`で検索を呼び出すパターンをよく見かけます。自分のブログにも取り入れてみました。

SearchBoxと同じPagefind APIを使っていますが、コマンドパレットでは以下の点が異なります。

- HTML `<dialog>`要素をベースに実装し、Escキーやバックドロップクリックはブラウザネイティブの挙動に任せている
- 200msのデバウンスをかけて、入力中の不要なAPI呼び出しを抑制
- 結果は最大8件に絞り、素早く目的の記事にたどり着けるようにしている

`BaseLayout.astro`で`<CommandPalette client:load />`として全ページに配置しています。

以下はコマンドパレットの表示例です。

![⌘Kコマンドパレット](/images/posts/astro-pagefind-search/search-command-palette.png)
*⌘Kで呼び出したコマンドパレット。検索結果から直接記事に遷移できる*

## まとめ

astro-pagefindの導入自体は、パッケージのインストールと`astro.config.mjs`への1行追加だけで完了します。それだけで静的サイトに全文検索が入る手軽さが最大の魅力だと感じました。

デザインを自前で作り込みたい場合は、**Pagefind APIを直接使ったカスタムUI構築**という選択肢があります。APIのインターフェースがシンプルなので、Reactコンポーネントとして自然に実装できました。

| 方式         | メリット                  | デメリット                 |
|--------------|-----------------------|-----------------------|
| Pagefind UI  | 設定ゼロで検索UIが表示される | デザインカスタマイズに制約がある    |
| Pagefind API | 完全にデザインを制御できる     | UIを自分で構築する必要がある |

[^1]: 公式ドキュメントより: "Pagefind can run a full-text search on a 10,000 page site with a total network payload under 300kB, including the Pagefind library itself." [Pagefind](https://pagefind.app/)
[^2]: Pagefind UIのソースコードは`pagefind_ui/default/svelte/`配下にSvelteコンポーネント（`ui.svelte`, `result.svelte`等）として実装されています。[pagefind_ui/default/svelte - GitHub](https://github.com/CloudCannon/pagefind/tree/main/pagefind_ui/default/svelte)
[^3]: Pagefind APIドキュメントより: "Calling `pagefind.init()` when your search interface gains focus will help the core dependencies load by the time a user types in their search query." [Pagefind API](https://pagefind.app/docs/api/)
[^4]: `@vite-ignore`はViteの公式ドキュメントには正式に記載されていませんが、動的importの解析をスキップする手段として広く使われています。[関連Issue: vitejs/vite#14850](https://github.com/vitejs/vite/issues/14850)

## 参考

<https://pagefind.app/>

<https://github.com/shishkin/astro-pagefind>
