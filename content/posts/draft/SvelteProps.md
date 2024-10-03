+++
title = 'SvelteProps'
date = 2024-09-22T05:57:38+09:00
draft = true
+++

Svelteの学習メモ。

Propsの受け渡しについて
だいたいReact, Vueと同じ感じがする

## 宣言

App.svelte

```svelte
<script>
  import Nested from './Nested.svelte';
</script>

<Nested name="KJR020"/>
```

Nested.svelte

```svelte
<script>
  export let name;
</script>

<p>My {name} is </p>
```

## デフォルト値の指定

```svelte
<script>
  export let name = 'KJR020';
</script>
```

## スプレッド演算子

```svelte
<script>
import PackageInfo from './PackageInfo.svelte';

const pkg = {
  name: 'svelte',
  speed: 'blazing',
  version: 4,
  website: 'https://svelte.dev'
};
</>

<PackageInfo
	name={pkg.name}
	speed={pkg.speed}
	version={pkg.version}
	website={pkg.website}
/>

// スプレッド演算子で書いた場合
<PackageInfo {...pkg}/>
```
