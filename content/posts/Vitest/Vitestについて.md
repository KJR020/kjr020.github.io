+++
title = 'Vitestについて'
date = 2024-10-12T22:20:17+09:00
draft = false
tags = ['Vitest']
+++

## 経緯

最近、業務でフロントエンドの開発タスクを担当することになりました。
テスティングフレームワークとして`Vitest`が採用されているということで、  
キャッチアップのために`Vitest`について調べてみました。  

フロントエンドの開発自体まったくの初心者なので、JestやVitestの名前は聞いたことがある程度で、実際に使ったことはありません。  
なので今回は概要から調べてみました。

## Vitestとは？

公式サイトをまずは読んでみます。

<https://vitest.dev/>

Vite-native ということで、Viteと併せて使うテスティングフレームワークのようです。

## Why Vitest? を読む

「ライブラリやフレームワークを効果的に使用するためには、思想を理解するべきだ」という話を聞いたことがあります。  
これは確かにそうだなと思うので、私もそれに習いたいと思います。  
さしあたって、まずは公式ドキュメントのWhy Vitest?のページを読んでみます。

<https://vitest.dev/guide/why.html>

The Need for A Native Test Runner

## 疑問点

そもそもフロントエンドのテストの全容について分かってません。
なぜ、テスティングフレームワークについて
Vitestは何を解決するために登場したか、
Viteとの統合に最適化するため
では、そもそもなぜViteがテストに必要となるのでしょうか？
Viteは開発サーバーを動作させるDebug環境という認識でした。
なぜViteがフロントエンドテストに使用されるか？を調べます

答えとしては、フロントエンドのテストではブラウザの機能に依存するものがある
そのため、従来は、ブラウザ機能のモックを用意する必要があった

Jest + jsdom や Karma、Puppeteerといった環境でテストされていたようです。
これらは、テストランナーとアサーションライブラリ

## Why Vitest? の要約

公式ドキュメントによると、Vitestは「Viteの開発体験をそのままテストにも活かせる」ことを主眼に設計されています。

従来のテストランナー（JestやKarma等）は、Viteの高速なモジュールバンドルやHMR（Hot Module Replacement）などの恩恵を受けられませんでした。

VitestはViteのネイティブテストランナーとして、
- 高速なテスト実行
- Viteの設定・プラグインをそのまま活用
- TypeScript・ESMサポート
- ウォッチモードやインタラクティブなデバッグ
など、現代的な開発体験を提供します。

## Vitestの特徴

- **Viteとのシームレスな統合**: Viteの設定やプラグインがそのまま使える。
- **高速なテスト実行**: Viteのキャッシュ・バンドル技術を活用。
- **TypeScript/ESMサポート**: モダンなJS/TS環境に最適。
- **柔軟なAPI**: Jest互換APIで移行も簡単。
- **豊富なレポート出力**: CLIやHTMLレポートも。

## デメリット・注意点

- Vite非対応プロジェクトでは導入メリットが薄い。
- Jestエコシステムの一部（古いプラグイン等）が使えない場合がある。
- 新しめのツールなので情報量はJest等より少ない。

## インストール方法

```bash
npm install -D vitest
```

Viteプロジェクトならすぐに使えます。設定例（vite.config.tsの抜粋）：

```typescript
import { defineConfig } from 'vite';
import { type UserConfigExport } from 'vitest/config';

/**
 * Vite + Vitest 設定例
 * @returns {UserConfigExport} 設定オブジェクト
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
} as UserConfigExport);
```

## 基本的なテストコード例

`src/utils/sum.ts`:
```typescript
/**
 * 2つの数値を加算する関数
 * @param {number} a - 加算する値1
 * @param {number} b - 加算する値2
 * @returns {number} 合計値
 */
export const sum = (a: number, b: number): number => a + b;
```

`src/utils/sum.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { sum } from './sum';

describe('sum 関数のテスト', () => {
  it('1 + 2 = 3 になる', () => {
    expect(sum(1, 2)).toBe(3);
  });
  it('負の値にも対応', () => {
    expect(sum(-1, 2)).toBe(1);
  });
});
```

## まとめ・感想

VitestはViteユーザーにとって非常に親和性が高く、セットアップも簡単です。
TypeScriptやESM環境でもストレスなく使え、Jest互換APIで移行も容易でした。
