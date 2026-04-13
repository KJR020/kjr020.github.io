# 設計根拠エビデンス集

本ドキュメントは `design.md` の各設計判断について、根拠となる一次情報（公式ドキュメント・論文・開発者の発言）を原文引用付きで整理したものです。

---

## 1. Scrapboxのリンクベース設計 × Zettelkasten

### 設計判断
> 知識の蓄積・接続方法として Zettelkasten メソッドを採用し、Scrapboxをその実装基盤とする

### 根拠

#### 1-1. Scrapbox開発者 増井俊之「階層的管理は常人には難しい」

> 個人的な雑多なデータを階層的に管理することは常人にはとても難しい

> 特別なタグ検索機能を用意しなくても、タグ的なものをすべて独立したWikiページとして作成するだけでタグを用いた検索が利用できる

**出典**: https://gihyo.jp/dev/serial/01/masui-columbus/0016

#### 1-2. Scrapbox開発者 橋本商会(shokai)「階層整理型Wikiはスケールしない」

> 今後人間を増やさず、新製品を未来永劫作らない会社は階層ドキュメントツールで文書共有していても大丈夫

> 超絶難しい分類ルールができて、「新入りは半年ROMって空気読め」みたいな感じになる

> ルールに従った分類ではなく、ドキュメント間の関連を記述できる事と、その関連に基づいた推薦システム

**出典**: https://scrapbox.io/shokai/%E9%9A%8E%E5%B1%A4%E6%95%B4%E7%90%86%E5%9E%8Bwiki%E3%81%AF%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%AB%E3%81%97%E3%81%AA%E3%81%84

#### 1-3. ScrapboxとZettelkastenの共通ルーツ

> 普通の研究の作法をツールに落とし込んでscrapboxにしたつもりだったけど、その大本がルーマンだったのは知らなかった

**出典**: https://scrapbox.io/Imoduru/Zettelkasten_method

#### 1-4. Luhmann「ノートはネットワークの一部として価値を持つ」

> Each note is just an element that gets its value from being a part of a network of references

> the communication is enriched if you succeed to activate the internal network of connections

**出典**: https://zettelkasten.de/communications-with-zettelkastens/

#### 1-5. Zettelkasten.de「接続こそが本質」

> The true magic of a Zettelkasten...comes from the heavy emphasis on connection. Each new Zettel needs to be placed in some relationship to another Zettel.

> If you just add links without any explanation you will not create knowledge.

**出典**: https://zettelkasten.de/introduction/

#### 1-6. 増井俊之「情報を階層的に関連するのをやめる」

> 情報を階層的に関連するのをやめ、あらゆる情報をクラウドに置くことによって情報整理に関する精神の重荷はかなり軽減される

**出典**: https://gihyo.jp/dev/serial/01/masui-columbus/0017

---

## 2. 「強い体系をベースにする」アプローチ — スキーマ理論

### 設計判断
> 参照フレームワーク（SWEBOK、roadmap.sh等）を「手本」として取り込み、そこに自分の知識をマッピングする

### 根拠

#### 2-1. Ausubel「学習に最も影響する要因は既有知識」

> The most important single factor influencing learning is what the learner already knows. Ascertain this and teach him accordingly. (Ausubel, 1968)

**出典**: https://pmc.ncbi.nlm.nih.gov/articles/PMC10130311/

#### 2-2. Ausubelの有意味学習の3つの統合メカニズム

> **Derivative subsumption**: Adding details that extend existing concepts without restructuring them
>
> **Correlative subsumption**: Modifying frameworks when new information requires reconceptualization
>
> **Obliterative subsumption**: When specific details merge into broader, more usable principles

**出典**: https://distancelearning.institute/instructional-design/ausubel-advance-organizers-learning/

#### 2-3. Rumelhart「スキーマは認知の構成要素」

> schemata can represent knowledge at all levels - from ideologies and cultural truths to knowledge about the meaning of a particular word (David Rumelhart)

> the building blocks of cognition

**出典**: https://www.learning-theories.org/doku.php?id=learning_theories:schema_theory

#### 2-4. Anderson「理解とはスキーマの活性化」

> Comprehension is a matter of activating this schema and then constructing a new schema that provides a coherent explanation of these new ideas (Anderson, 1994)

**出典**: https://www.ebsco.com/research-starters/psychology/schema-theory

#### 2-5. Piaget「同化と調節によるスキーマの変容」

> A schema is a knowledge structure that allows organisms to interpret and understand the world around them.

> **Assimilation**: New information becomes incorporated into pre-existing schemas.

> **Accommodation**: Existing schemas may be altered or new ones formed as a person learns new information or has new experiences. This disrupts the structure of pre-existing schemas and may lead to the creation of a new schema altogether.

**出典**: https://www.simplypsychology.org/what-is-a-schema.html

---

## 3. SWEBOK v4 — SE分野の最上位分類体系

### 設計判断
> SWEBOK v4の18 Knowledge Areasをソフトウェアエンジニアリングドメインの参照フレームワークとして使用する

### 根拠

#### 3-1. IEEE Computer Society 公式

> The Guide to the Software Engineering Body of Knowledge (SWEBOK Guide), published by the IEEE Computer Society (IEEE CS), reflects the current state of generally accepted, consensus-driven knowledge derived from the interaction between software engineering theory and practice. Its 18 knowledge areas (KAs) summarize key concepts and include a reference list for detailed information.

> Additionally, three new knowledge areas -- Software Architecture, Software Engineering Operations, and Software Security -- have been added to enhance the foundational knowledge in software engineering.

**出典**: https://www.computer.org/education/bodies-of-knowledge/software-engineering

#### 3-2. SWEBOK v4 18 Knowledge Areas 完全リスト

| Chapter | Knowledge Area |
|---------|---------------|
| 1 | Software Requirements |
| 2 | Software Architecture (NEW) |
| 3 | Software Design |
| 4 | Software Construction |
| 5 | Software Testing |
| 6 | Software Engineering Operations (NEW) |
| 7 | Software Maintenance |
| 8 | Software Configuration Management |
| 9 | Software Engineering Management |
| 10 | Software Engineering Process |
| 11 | Software Engineering Models and Methods |
| 12 | Software Quality |
| 13 | Software Security (NEW) |
| 14 | Software Engineering Professional Practice |
| 15 | Software Engineering Economics |
| 16 | Computing Foundations |
| 17 | Mathematical Foundations |
| 18 | Engineering Foundations |

**出典**: https://computer.org/education/bodies-of-knowledge/software-engineering/topics

---

## 4. Bloom's Taxonomy 改訂版 — 知識の深さ尺度

### 設計判断
> オプションの深さタグ（`[深さ/知っている]`等）をBloom's Taxonomyに基づいて設計する

### 根拠

#### 4-1. Anderson & Krathwohl (2001) の6段階定義

> **Remember**: retrieve, recall, or recognize relevant knowledge from long-term memory
>
> **Understand**: demonstrate comprehension through one or more forms of explanation
>
> **Apply**: use information or a skill in a new situation
>
> **Analyze**: break material into its constituent parts and determine how the parts relate to one another and/or to an overall structure or purpose
>
> **Evaluate**: make judgments based on criteria and standards
>
> **Create**: put elements together to form a new coherent or functional whole; reorganize elements into a new pattern or structure

**出典**: https://www.coloradocollege.edu/other/assessment/how-to-assess-learning/learning-outcomes/blooms-revised-taxonomy.html

#### 4-2. Krathwohl (2002) — 2次元フレームワーク

Knowledge Dimensionの4タイプ:
- **Factual Knowledge**: 基本的な要素
- **Conceptual Knowledge**: 概念間の相互関係
- **Procedural Knowledge**: 手順・方法
- **Metacognitive Knowledge**: 認知についての認知

**出典**: Krathwohl, D.R. (2002). "A Revision of Bloom's Taxonomy: An Overview." *Theory Into Practice*, 41(4), 212-218. https://www.tandfonline.com/doi/abs/10.1207/s15430421tip4104_2

#### 4-3. 旧版からの変更点

> Anderson and Krathwohl's taxonomy employs action words or verbs to help educators understand how learners acquire knowledge.

旧版(1956): 名詞形 — Knowledge, Comprehension, Application, Analysis, Synthesis, Evaluation
改訂版(2001): 動詞形 — Remember, Understand, Apply, Analyze, Evaluate, Create

**出典**: https://resources.nu.edu/RevisedBloomsTaxonomy

---

## 5. Cytoscape.js — グラフ可視化ライブラリ選定

### 設計判断
> Phase 2の知識グラフ可視化にCytoscape.jsを採用する

### 根拠

#### 5-1. Cytoscape.js 公式 — グラフ理論ライブラリとしての位置づけ

> Cytoscape.js is a fully featured graph theory library. Do you need to model and/or visualise relational data, like biological data or social networks? If so, Cytoscape.js is just what you need.

> Cytoscape.js contains a graph theory model and an optional renderer to display interactive graphs. This library was designed to make it as easy as possible for programmers and scientists to use graph theory in their apps.

主要特徴:
> - No external dependencies
> - Highly optimised
> - Includes graph theory algorithms, from BFS to PageRank
> - Uses stylesheets to separate presentation from data
> - Permissive open source license (MIT) for the core

**出典**: https://js.cytoscape.org/

#### 5-2. Oxford Bioinformatics 論文 (2023) — 採用実績

> Cytoscape.js is an open-source JavaScript-based graph library. Its most common use case is as a visualization software component, so it can be used to render interactive graphs in a web browser.

> On GitHub, the most widely used platform for distributing open-source projects, Cytoscape.js is in the top 0.01% of software packages by popularity measured by number of user stars.

> Cytoscape.js is used by research groups (e.g. Ensembl, FlyBase and WormBase)...governmental organizations...and commercial organizations [e.g. Google, QuantStack (Jupyter) and Plotly].

> It is a critical software component used in research fields such as biology, sociology, computer security, cloud computing and data science.

**出典**: https://pmc.ncbi.nlm.nih.gov/articles/PMC9889963/

#### 5-3. npm比較データ

| Metric | cytoscape | vis-network | d3-graphviz |
|--------|-----------|-------------|------------|
| Weekly Downloads | 3,592,311 | 468,661 | 49,704 |
| GitHub Stars | 10,886 | 3,532 | 1,793 |
| License | MIT | Apache-2.0/MIT | BSD-3-Clause |

**出典**: https://npm-compare.com/cytoscape,d3-graphviz,vis-network

#### 5-4. D3.jsとの比較

> For maximum styling freedom, D3.js is the choice. However, D3 requires a pretty steep learning curve, and you'd have to invest a decent amount of time in wrapping your head around its concepts and getting started with it.

**出典**: https://smfthemes.org/evaluating-top-node-charting-libraries-for-dynamic-data-visualization/

---

## 6. Astro Islands Architecture

### 設計判断
> `/knowledge` ページをAstroページ + React Island（`client:load`）で構成する

### 根拠

#### 6-1. Astro公式 — Islands Architecture

> In Astro, an island is an enhanced UI component on an otherwise static page of HTML.

> Islands architecture works by rendering the majority of your page to fast, static HTML with smaller 'islands' of JavaScript added when interactivity or personalization is needed on the page.

> The most obvious benefit of building with Astro Islands is performance: the majority of your website is converted to fast, static HTML and JavaScript is only loaded for the individual components that need it.

**出典**: https://docs.astro.build/en/concepts/islands/

#### 6-2. Astro公式 — パフォーマンスメリット

> Zero JS, by default: Less client-side JavaScript to slow your site down.

> An Astro website can load 40% faster with 90% less JavaScript than the same site built with the most popular React web framework.

**出典**: https://docs.astro.build/en/concepts/why-astro/

#### 6-3. Client Directives（Phase 2でclient:visibleを活用）

> **client:load** - Load and hydrate the component JavaScript immediately on page load. Priority: High.
>
> **client:visible** - Load and hydrate the component JavaScript once the component has entered the user's viewport. Uses an `IntersectionObserver` internally. Priority: Low.

**出典**: https://docs.astro.build/en/reference/directives-reference/

---

## 7. TanStack Query — ページネーション並列化

### 設計判断
> 1,788ページの全件取得に `useQueries` による並列フェッチを使用。staleTime=5分

### 根拠

#### 7-1. TanStack Query公式 — Dynamic Parallel Queries

> If the number of queries you need to execute is changing from render to render, you cannot use manual querying since that would violate the rules of hooks. Instead, TanStack Query provides a `useQueries` hook, which you can use to dynamically execute as many queries in parallel as you'd like.

```tsx
const ids = [1, 2, 3]
const results = useQueries({
  queries: ids.map((id) => ({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
    staleTime: Infinity,
  })),
})
```

**出典**: https://tanstack.com/query/latest/docs/framework/react/reference/useQueries

#### 7-2. TanStack Query公式 — staleTime設計指針

> Query instances via `useQuery` or `useInfiniteQuery` by default consider cached data as stale. To change this behavior, you can configure your queries both globally and per-query using the `staleTime` option. Specifying a longer `staleTime` means queries will not refetch their data as often.

**出典**: https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults

---

## 8. Cloudflare Pages Functions — 新規Proxyエンドポイント

### 設計判断
> `/api/knowledge/:project` を Cloudflare Pages Functions のファイルベースルーティングで追加

### 根拠

#### 8-1. Cloudflare公式 — Pages Functions概要

> Pages Functions enable developers to build full-stack applications by executing code on the Cloudflare network with Cloudflare Workers.

**出典**: https://developers.cloudflare.com/pages/functions/

#### 8-2. Cloudflare公式 — ファイルベースルーティング

> Functions utilize file-based routing. Your `/functions` directory structure determines the designated routes that your Functions will run on.

動的ルーティング: `/users/[user].js` → `/users/daniel`

**出典**: https://developers.cloudflare.com/pages/functions/routing/

---

## 9. Zod — 再帰的スキーマバリデーション

### 設計判断
> 参照フレームワークYAMLの再帰的カテゴリ階層のバリデーションにZodを使用

### 根拠

#### 9-1. Zod公式 — 再帰型の定義

> To define a self-referential type, use a getter on the key. This lets JavaScript resolve the cyclical schema at runtime.

```javascript
const Category = z.object({
  name: z.string(),
  get subcategories(){
    return z.array(Category)
  }
});
```

**出典**: https://zod.dev/api

#### 9-2. Astro公式 — Content CollectionsでのZod推奨

> Schemas enforce consistent frontmatter or entry data within a collection through Zod validation. A schema **guarantees** that this data exists in a predictable form when you need to reference or query it.

> With Zod, Astro is able to validate every file's data within a collection _and_ provide automatic TypeScript types when you query content from inside your project.

**出典**: https://docs.astro.build/en/guides/content-collections/

---

## 10. T字型スキルモデル — 成長戦略

### 設計判断
> T字型→Pi型→Comb型のスキルモデルを知識体系の成長戦略フレームワークとして参照する

### 根拠

#### 10-1. Tim Brown (IDEO CEO) によるT字型人材の定義

> T-shaped people have two kinds of characteristics, hence the use of the letter 'T' to describe them. The vertical stroke of the 'T' is a depth of skill that allows them to contribute to the creative process. [...] The horizontal stroke of the 'T' is the disposition for collaboration across disciplines. It is composed of two things. First, empathy. [...] Second, they tend to get very enthusiastic about other people's disciplines, to the point that they may actually start to practice them.

**出典**: https://chiefexecutive.net/ideo-ceo-tim-brown-t-shaped-stars-the-backbone-of-ideoaes-collaborative-culture__trashed/

#### 10-2. 用語の起源 — David Guest (1991) / McKinsey

> "T-shaped people" first appeared in Guest's 1991 article in *The Independent*, describing computing professionals with "depth of skill" in technical areas like programming, complemented by horizontal "breadth" in interpersonal and business skills.

> The term originated in the 1980s at McKinsey & Company, where it "described the ideal profile for consultants: experts with functional depth who could also navigate cross-disciplinary challenges."

**出典**: https://grokipedia.com/page/T-shaped_skills

#### 10-3. Ross Dawson — T型→Pi型→Comb型の進化

> [T-shaped skills:] "deep, world-class expertise, combined with breadth to span disciplines and understand the context for that expertise"

> [Pi-shaped skills:] "breadth is combined with not one but two separate domains of deep expertise, creating a shape similar to the symbol for Pi"

> [Comb-shaped skills:] "many specific domains of expertise as well as breadth" [...] in "an increasingly complex, interconnected and interdependent world."

**出典**: https://rossdawson.com/building-future-success-t-shaped-pi-shaped-and-comb-shaped-skills/

#### 10-4. ソフトウェア開発チームでの有効性

> "about 90% of the time, knowledge work doesn't require skill specialists," and organizations adopting T-shaped approaches have "a history of saving time and money."

> This approach transforms teams from "groups of individual contributors on temporary teams to groups of problem-solvers who want to help the team succeed," where "roles start to fall away."

**出典**: https://www.sketchdev.io/blog/t-shaped-skills-breadth-and-depth-make-better-teams

---

## 11. roadmap.sh — 実践的技術ロードマップ

### 設計判断
> roadmap.shのバックエンドロードマップをSWEBOK各KA内の実践的サブカテゴリとして使用する

### 根拠

#### 11-1. roadmap.sh公式 — プロジェクト概要

> roadmap.sh contains community-curated roadmaps, study plans, paths, and resources for developers.

> [Creator Kamran Ahmed:] created roadmap.sh to help developers find their path if they are confused and help them learn and grow in their career.

> the 6th most starred opensource project on GitHub [with] 351K [stars]

**出典**: https://roadmap.sh/about

#### 11-2. Backend Roadmapの構造と注意書き

> Backend development refers to the server-side aspect of web development, focusing on creating and managing the server logic, databases, and APIs.

> not everything listed on this roadmap to get into the industry; every job is different and most roles will require a subset.

**出典**: https://roadmap.sh/backend

#### 11-3. コミュニティ評価

> The platform is open-source, allowing developers from around the world to contribute their knowledge and expertise.

> By providing a clear, comprehensive, and up-to-date view of the developer landscape, roadmap.sh is helping to bridge the gap between education and industry needs.

**出典**: https://ones.com/blog/roadmap-sh-revolutionizes-developer-learning-paths/

---

## 12. Scrapbox API仕様 — データソース

### 設計判断
> Scrapbox APIのdescriptions（先頭5行）を体系タグ抽出のデータソースとし、ページ詳細APIのlinks/relatedPagesを知識グラフの接続情報に使用する

### 根拠

#### 12-1. Scrapbox公式ヘルプ — API概要

> 「あくまで内部APIです。APIは予告なく変更を行います。」

エンドポイント一覧:
- `/api/pages/:projectName` (ページリスト)
- `/api/pages/:projectName/:pageTitle` (ページ)
- `/api/pages/:projectName/:pageTitle/text` (ページ本文)

**出典**: https://scrapbox.io/help-jp/API

#### 12-2. descriptionsフィールドの仕様（公式型定義）

```typescript
export interface BasePage {
  /** the thumbnail text of a page.
   * the maximum number of lines is 5. */
  descriptions: string[];
}
```

**出典**: https://github.com/scrapbox-jp/types/blob/main/base.ts

#### 12-3. ページ詳細APIのリンク情報（型定義）

```typescript
export interface Page extends BasePage {
  lines: BaseLine[];
  links: string[];
  projectLinks: string[];
  relatedPages: RelatedPages;
}

export interface RelatedPages {
  links1hop: RelatedPage[];
  links2hop: RelatedPage[];
  hasBackLinksOrIcons: boolean;
}
```

**出典**: https://github.com/scrapbox-jp/types/blob/main/api/pages/project.ts

#### 12-4. Private ProjectのAPI認証方式

> 「publicプロジェクトのAPIは単純にGETすればデータが得られるが、privateプロジェクトでそれをやると401になる。ログイン状態でprivateプロジェクトにアクセスすると、クッキーに認証情報がセットされる。」

> 「このクッキーは[Secure]で[HttpOnly]なのでdocument.cookieを見てもわからない。」

**出典**: https://scrapbox.io/nishio/Scrapbox%E3%81%AEprivate%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AEAPI%E3%82%92%E5%8F%A9%E3%81%8F

---

## 13. グラフ可視化のUXベストプラクティス

### 設計判断
> プログレッシブローディング（暫定表示→全件確定）、ノード/エッジのインタラクション設計

### 根拠

#### 13-1. Cambridge Intelligence — プログレッシブディスクロージャ

> Use progressive disclosure, giving 'detail on demand' controlled by interactive zooming, filtering, and clustering.

**出典**: https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/

#### 13-2. yFiles — ナレッジグラフの段階的表示

> Start with a simplified view and reveal additional details on demand. Expand-on-demand via SPARQL/Cypher. This keeps the graph readable while still offering depth.

**出典**: https://www.yfiles.com/resources/how-to/guide-to-visualizing-knowledge-graphs

#### 13-3. Cambridge Intelligence — インタラクション規約

> Follow established UI and UX conventions where they exist -- intuition is key. Provide onboarding or tooltips to help the user understand how to navigate more complex visualizations.

> [Standard gestures:] pinch to zoom, drag to pan [and applying] consistent styling across the graph.

**出典**: https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/

#### 13-4. Cambridge Intelligence — 大規模グラフの3つの問題

> **Hairballs**: Using techniques like filtering or social network analysis is the best way to untangle a hairball.

> **Snowstorms**: Fix by enriching your data or running algorithms that explore your data more deeply.

> **Starbursts**: Address through redesigning the data model, limiting expansion, grouping less important nodes, or even removing the central node entirely.

**出典**: https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/

#### 13-5. Nielsen Norman Group — プログレスインジケータ

> Use a progress indicator for any action that takes longer than about 1.0 second.

> Users experience higher satisfaction with a site and are willing to wait longer when the site uses a dynamic progress indicator.

タイミング基準: 1秒未満→不要、2-10秒→ループアニメーション、10秒以上→パーセント表示

**出典**: https://www.nngroup.com/articles/progress-indicators/

---

## 出典一覧

| # | 分類 | 出典 |
|---|------|------|
| 1-1 | Scrapbox設計思想 | https://gihyo.jp/dev/serial/01/masui-columbus/0016 |
| 1-2 | Scrapbox設計思想 | https://scrapbox.io/shokai/階層整理型wikiはスケールしない |
| 1-3 | Scrapbox × Zettelkasten | https://scrapbox.io/Imoduru/Zettelkasten_method |
| 1-4 | Zettelkasten原典 | https://zettelkasten.de/communications-with-zettelkastens/ |
| 1-5 | Zettelkasten原則 | https://zettelkasten.de/introduction/ |
| 1-6 | Scrapbox設計思想 | https://gihyo.jp/dev/serial/01/masui-columbus/0017 |
| 2-1 | Ausubel有意味学習 | https://pmc.ncbi.nlm.nih.gov/articles/PMC10130311/ |
| 2-2 | Ausubel先行オーガナイザー | https://distancelearning.institute/instructional-design/ausubel-advance-organizers-learning/ |
| 2-3 | Rumelhart スキーマ理論 | https://www.learning-theories.org/doku.php?id=learning_theories:schema_theory |
| 2-4 | Anderson スキーマ理論 | https://www.ebsco.com/research-starters/psychology/schema-theory |
| 2-5 | Piaget スキーマ理論 | https://www.simplypsychology.org/what-is-a-schema.html |
| 3-1 | SWEBOK v4 公式 | https://www.computer.org/education/bodies-of-knowledge/software-engineering |
| 3-2 | SWEBOK v4 KA一覧 | https://computer.org/education/bodies-of-knowledge/software-engineering/topics |
| 4-1 | Bloom改訂版定義 | https://www.coloradocollege.edu/other/assessment/how-to-assess-learning/learning-outcomes/blooms-revised-taxonomy.html |
| 4-2 | Krathwohl (2002) | https://www.tandfonline.com/doi/abs/10.1207/s15430421tip4104_2 |
| 4-3 | Bloom旧版vs改訂版 | https://resources.nu.edu/RevisedBloomsTaxonomy |
| 5-1 | Cytoscape.js公式 | https://js.cytoscape.org/ |
| 5-2 | Cytoscape.js論文 | https://pmc.ncbi.nlm.nih.gov/articles/PMC9889963/ |
| 5-3 | npm比較 | https://npm-compare.com/cytoscape,d3-graphviz,vis-network |
| 5-4 | D3.js比較 | https://smfthemes.org/evaluating-top-node-charting-libraries-for-dynamic-data-visualization/ |
| 6-1 | Astro Islands | https://docs.astro.build/en/concepts/islands/ |
| 6-2 | Astro Why | https://docs.astro.build/en/concepts/why-astro/ |
| 6-3 | Astro Directives | https://docs.astro.build/en/reference/directives-reference/ |
| 7-1 | TanStack useQueries | https://tanstack.com/query/latest/docs/framework/react/reference/useQueries |
| 7-2 | TanStack staleTime | https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults |
| 8-1 | CF Pages Functions | https://developers.cloudflare.com/pages/functions/ |
| 8-2 | CF ルーティング | https://developers.cloudflare.com/pages/functions/routing/ |
| 9-1 | Zod再帰型 | https://zod.dev/api |
| 9-2 | Astro × Zod | https://docs.astro.build/en/guides/content-collections/ |
| 10-1 | T字型 Tim Brown | https://chiefexecutive.net/ideo-ceo-tim-brown-t-shaped-stars-the-backbone-of-ideoaes-collaborative-culture__trashed/ |
| 10-2 | T字型 起源 | https://grokipedia.com/page/T-shaped_skills |
| 10-3 | Pi型/Comb型 Dawson | https://rossdawson.com/building-future-success-t-shaped-pi-shaped-and-comb-shaped-skills/ |
| 10-4 | T字型 SW開発 | https://www.sketchdev.io/blog/t-shaped-skills-breadth-and-depth-make-better-teams |
| 11-1 | roadmap.sh公式 | https://roadmap.sh/about |
| 11-2 | Backend Roadmap | https://roadmap.sh/backend |
| 11-3 | roadmap.sh評価 | https://ones.com/blog/roadmap-sh-revolutionizes-developer-learning-paths/ |
| 12-1 | Scrapbox API公式 | https://scrapbox.io/help-jp/API |
| 12-2 | descriptions型定義 | https://github.com/scrapbox-jp/types/blob/main/base.ts |
| 12-3 | ページ詳細型定義 | https://github.com/scrapbox-jp/types/blob/main/api/pages/project.ts |
| 12-4 | Private API認証 | https://scrapbox.io/nishio/ScrapboxのprivateプロジェクトのAPIを叩く |
| 13-1 | グラフUX | https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/ |
| 13-2 | KG段階的表示 | https://www.yfiles.com/resources/how-to/guide-to-visualizing-knowledge-graphs |
| 13-3 | グラフインタラクション | https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/ |
| 13-4 | 大規模グラフ問題 | https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/ |
| 13-5 | プログレスバー | https://www.nngroup.com/articles/progress-indicators/ |
