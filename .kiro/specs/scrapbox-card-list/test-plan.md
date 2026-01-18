# テスト計画: scrapbox-card-list

## 概要

本ドキュメントは、Scrapbox Card List 機能のテスト計画を定義する。Vitest + React Testing Library を使用した単体テスト、MSW によるモック、Playwright による E2E テストを含む。

## テスト環境

### 必要パッケージ

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react msw
```

### ファイル構成

```
src/
├── __tests__/
│   ├── setup.ts                  # テストセットアップ
│   ├── fixtures/
│   │   └── scrapbox.ts           # テストデータ
│   └── mocks/
│       └── handlers.ts           # MSW ハンドラー
├── components/
│   └── scrapbox/
│       ├── ScrapboxCard.tsx
│       ├── ScrapboxCard.test.tsx
│       ├── ScrapboxCardList.tsx
│       └── ScrapboxCardList.test.tsx
├── hooks/
│   ├── useScrapboxData.ts
│   ├── useScrapboxData.test.ts
│   ├── useImageLazyLoad.ts
│   └── useImageLazyLoad.test.ts
scripts/
├── fetch-scrapbox.ts
└── fetch-scrapbox.test.ts
```

---

## 1. ビルドスクリプト（fetch-scrapbox.ts）

### 1.1 データ変換

| ID | テストケース | 入力 | 期待結果 |
|----|-------------|------|----------|
| BS-01 | descriptions 配列の結合 | `["line1", "line2", "line3"]` | `"line1 line2 line3"` |
| BS-02 | 空の descriptions 配列 | `[]` | `""` |
| BS-03 | Unix → ISO 8601 変換 | `1705449600` | `"2024-01-17T00:00:00.000Z"` |
| BS-04 | URL 生成（通常） | `"Hello World"` | `"https://scrapbox.io/proj/Hello%20World"` |
| BS-05 | URL 生成（日本語） | `"テストページ"` | `"https://scrapbox.io/proj/%E3%83%86%E3%82%B9%E3%83%88..."` |
| BS-06 | URL 生成（特殊文字） | `"foo/bar"` | 正しくエンコード |

### 1.2 API 取得

| ID | テストケース | 条件 | 期待結果 |
|----|-------------|------|----------|
| BS-07 | 正常取得 | API 成功 | ScrapboxDataFile 形式で返却 |
| BS-08 | ネットワークエラー | API 失敗 | FetchError をスロー |
| BS-09 | 不正レスポンス | 必須フィールド欠落 | バリデーションエラー |
| BS-10 | 環境変数読み取り | `SCRAPBOX_PROJECT` 設定 | 環境変数の値を使用 |

### サンプルコード

```typescript
// fetch-scrapbox.test.ts
import { describe, it, expect, vi } from 'vitest';
import { transformDescriptions, transformTimestamp, generatePageUrl, fetchScrapboxPages } from './fetch-scrapbox';

describe('fetch-scrapbox', () => {
  describe('transformDescriptions', () => {
    it('BS-01: descriptions 配列を空白区切りで結合する', () => {
      const result = transformDescriptions(['line1', 'line2', 'line3']);
      expect(result).toBe('line1 line2 line3');
    });

    it('BS-02: 空配列は空文字を返す', () => {
      const result = transformDescriptions([]);
      expect(result).toBe('');
    });
  });

  describe('transformTimestamp', () => {
    it('BS-03: Unix タイムスタンプを ISO 8601 形式に変換する', () => {
      const result = transformTimestamp(1705449600);
      expect(result).toBe('2024-01-17T00:00:00.000Z');
    });
  });

  describe('generatePageUrl', () => {
    it('BS-04: タイトルを URL エンコードしてページ URL を生成する', () => {
      const result = generatePageUrl('project', 'Hello World');
      expect(result).toBe('https://scrapbox.io/project/Hello%20World');
    });

    it('BS-05: 日本語タイトルを正しくエンコードする', () => {
      const result = generatePageUrl('project', 'テスト');
      expect(result).toContain('https://scrapbox.io/project/');
      expect(result).toContain('%');
    });
  });

  describe('fetchScrapboxPages', () => {
    it('BS-08: API 失敗時はエラーをスローする', async () => {
      await expect(fetchScrapboxPages('invalid-project')).rejects.toThrow();
    });
  });
});
```

---

## 2. useScrapboxData Hook

### 2.1 正常系

| ID | テストケース | 入力 | 期待結果 |
|----|-------------|------|----------|
| USD-01 | データ取得成功 | 有効な project | `{ isSuccess: true, data: [...] }` |
| USD-02 | limit 適用 | `limit: 3` | 配列長が 3 |
| USD-03 | キャッシュ利用 | 同じ project で 2 回呼び出し | fetch 1 回のみ |
| USD-04 | staleTime 内はキャッシュ使用 | 5 分以内の再取得 | キャッシュから返却 |

### 2.2 エラー系

| ID | テストケース | 条件 | 期待結果 |
|----|-------------|------|----------|
| USD-05 | 404 エラー | ファイル未存在 | `{ isError: true }` |
| USD-06 | ネットワークエラー | 通信失敗 | `{ isError: true }` |
| USD-07 | JSON パースエラー | 不正な JSON | `{ isError: true }` |

### サンプルコード

```typescript
// useScrapboxData.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useScrapboxData } from './useScrapboxData';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useScrapboxData', () => {
  it('USD-01: 正常にデータを取得できる', async () => {
    const { result } = renderHook(() => useScrapboxData('test-project'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it('USD-02: limit オプションでデータを制限できる', async () => {
    const { result } = renderHook(() => useScrapboxData('test-project', { limit: 3 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
  });

  it('USD-03: 同一 project のリクエストはキャッシュを使用する', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const wrapper = createWrapper();

    const { result: r1 } = renderHook(() => useScrapboxData('test-project'), { wrapper });
    await waitFor(() => expect(r1.current.isSuccess).toBe(true));

    const { result: r2 } = renderHook(() => useScrapboxData('test-project'), { wrapper });
    await waitFor(() => expect(r2.current.isSuccess).toBe(true));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('USD-05: 404 エラー時は isError が true になる', async () => {
    const { result } = renderHook(() => useScrapboxData('not-found-project'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

---

## 3. useImageLazyLoad Hook

### 3.1 状態管理

| ID | テストケース | 条件 | 期待結果 |
|----|-------------|------|----------|
| ILL-01 | 初期状態 | マウント直後 | `{ isInView: false, isLoaded: false }` |
| ILL-02 | viewport 進入 | Intersection 検知 | `{ isInView: true }` |
| ILL-03 | 画像読み込み完了 | onLoad 呼び出し | `{ isLoaded: true }` |

### 3.2 オプション

| ID | テストケース | 入力 | 期待結果 |
|----|-------------|------|----------|
| ILL-04 | カスタム rootMargin | `'300px'` | Observer に設定反映 |
| ILL-05 | カスタム threshold | `0.5` | Observer に設定反映 |

### サンプルコード

```typescript
// useImageLazyLoad.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageLazyLoad } from './useImageLazyLoad';

// IntersectionObserver モック
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

let intersectionCallback: IntersectionObserverCallback;

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', vi.fn((callback) => {
    intersectionCallback = callback;
    return {
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    };
  }));
});

describe('useImageLazyLoad', () => {
  it('ILL-01: 初期状態では isInView と isLoaded が false', () => {
    const { result } = renderHook(() => useImageLazyLoad());

    expect(result.current.isInView).toBe(false);
    expect(result.current.isLoaded).toBe(false);
  });

  it('ILL-02: viewport に入ると isInView が true になる', () => {
    const { result } = renderHook(() => useImageLazyLoad());

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isInView).toBe(true);
  });

  it('ILL-03: onLoad 呼び出し後に isLoaded が true になる', () => {
    const { result } = renderHook(() => useImageLazyLoad());

    act(() => {
      result.current.onLoad();
    });

    expect(result.current.isLoaded).toBe(true);
  });
});
```

---

## 4. ScrapboxCard コンポーネント

### 4.1 レンダリング

| ID | テストケース | 入力 | 期待結果 |
|----|-------------|------|----------|
| SC-01 | 全要素表示 | 完全なページデータ | タイトル、説明、画像が表示 |
| SC-02 | 画像なし | `imageUrl: null` | プレースホルダーアイコン表示 |
| SC-03 | 長い説明文 | 100 文字超 | 3 行で省略（line-clamp-3） |
| SC-04 | 短い説明文 | 50 文字以下 | 全文表示 |

### 4.2 インタラクション

| ID | テストケース | アクション | 期待結果 |
|----|-------------|-----------|----------|
| SC-05 | リンク属性 | - | `target="_blank"`, `rel="noopener noreferrer"` |
| SC-06 | ホバーエフェクト | マウスオーバー | CSS クラス変化 |
| SC-07 | クリック | カードクリック | Scrapbox ページへ遷移 |

### 4.3 アクセシビリティ

| ID | テストケース | 確認項目 | 期待結果 |
|----|-------------|---------|----------|
| SC-08 | 画像 alt | img 要素 | タイトルが alt に設定 |
| SC-09 | リンクテキスト | a 要素 | アクセシブルな名前 |

### サンプルコード

```typescript
// ScrapboxCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrapboxCard } from './ScrapboxCard';
import type { ScrapboxPageData } from '@/types/scrapbox';

const mockPage: ScrapboxPageData = {
  id: 'test-id',
  title: 'テストページ',
  imageUrl: 'https://example.com/image.png',
  description: 'これはテストの説明文です。',
  updatedAt: '2024-01-17T00:00:00.000Z',
  url: 'https://scrapbox.io/project/テストページ',
};

describe('ScrapboxCard', () => {
  describe('レンダリング', () => {
    it('SC-01: ページデータを正しくレンダリングする', () => {
      render(<ScrapboxCard page={mockPage} />);

      expect(screen.getByText('テストページ')).toBeInTheDocument();
      expect(screen.getByText('これはテストの説明文です。')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('src', mockPage.imageUrl);
    });

    it('SC-02: 画像がない場合はプレースホルダーを表示する', () => {
      render(<ScrapboxCard page={{ ...mockPage, imageUrl: null }} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
    });

    it('SC-03: 説明文が長い場合は省略クラスが適用される', () => {
      const longDescription = 'あ'.repeat(200);
      render(<ScrapboxCard page={{ ...mockPage, description: longDescription }} />);

      const descEl = screen.getByTestId('card-description');
      expect(descEl).toHaveClass('line-clamp-3');
    });
  });

  describe('インタラクション', () => {
    it('SC-05: リンクが新しいタブで開く設定になっている', () => {
      render(<ScrapboxCard page={mockPage} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('アクセシビリティ', () => {
    it('SC-08: 画像に適切な alt 属性が設定されている', () => {
      render(<ScrapboxCard page={mockPage} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', mockPage.title);
    });
  });
});
```

---

## 5. ScrapboxCardList コンポーネント

### 5.1 正常系

| ID | テストケース | 入力 | 期待結果 |
|----|-------------|------|----------|
| SCL-01 | 一覧表示 | データ 5 件 | カード 5 枚表示 |
| SCL-02 | limit 制限 | `limit={3}` | カード 3 枚 |
| SCL-03 | ローディング | fetch 中 | ローディング UI 表示 |

### 5.2 エラー系

| ID | テストケース | 条件 | 期待結果 |
|----|-------------|------|----------|
| SCL-04 | project 未指定 | `project=""` | エラーメッセージ表示 |
| SCL-05 | データ 0 件 | `pages: []` | 「ページが見つかりません」 |
| SCL-06 | ネットワークエラー | fetch 失敗 | リトライボタン表示 |
| SCL-07 | 404 エラー | JSON 未存在 | 「データが見つかりません」 |

### 5.3 レスポンシブ

| ID | テストケース | 画面幅 | 期待結果 |
|----|-------------|--------|----------|
| SCL-08 | デスクトップ | 1024px 以上 | 3 カラム |
| SCL-09 | タブレット | 768-1023px | 2 カラム |
| SCL-10 | モバイル | 767px 以下 | 1 カラム |

### サンプルコード

```typescript
// ScrapboxCardList.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ScrapboxCardList } from './ScrapboxCardList';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ScrapboxCardList', () => {
  describe('正常系', () => {
    it('SCL-01: ページ一覧を正しくレンダリングする', async () => {
      render(<ScrapboxCardList project="test-project" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByTestId('scrapbox-card').length).toBeGreaterThan(0);
      });
    });

    it('SCL-02: limit で表示件数を制限できる', async () => {
      render(<ScrapboxCardList project="test-project" limit={3} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByTestId('scrapbox-card')).toHaveLength(3);
      });
    });

    it('SCL-03: ローディング中はスピナーを表示する', () => {
      render(<ScrapboxCardList project="test-project" />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('エラー系', () => {
    it('SCL-04: project が未指定の場合はエラーを表示する', () => {
      render(<ScrapboxCardList project="" />, { wrapper: createWrapper() });

      expect(screen.getByText(/プロジェクト名を指定してください/)).toBeInTheDocument();
    });

    it('SCL-05: データが 0 件の場合はメッセージを表示する', async () => {
      render(<ScrapboxCardList project="empty-project" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/ページが見つかりません/)).toBeInTheDocument();
      });
    });

    it('SCL-06: エラー時はリトライボタンを表示する', async () => {
      render(<ScrapboxCardList project="error-project" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /再試行/ })).toBeInTheDocument();
      });
    });

    it('SCL-06: リトライボタンクリックで再取得する', async () => {
      const user = userEvent.setup();
      render(<ScrapboxCardList project="error-project" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /再試行/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /再試行/ }));
      // 再取得が行われることを確認
    });
  });
});
```

---

## 6. テストデータ（Fixtures）

```typescript
// src/__tests__/fixtures/scrapbox.ts
import type { ScrapboxDataFile, ScrapboxPageData } from '@/types/scrapbox';

export const mockPage: ScrapboxPageData = {
  id: 'page-1',
  title: 'テストページ 1',
  imageUrl: 'https://example.com/1.png',
  description: '説明文 1',
  updatedAt: '2024-01-16T00:00:00.000Z',
  url: 'https://scrapbox.io/test-project/%E3%83%86%E3%82%B9%E3%83%88%E3%83%9A%E3%83%BC%E3%82%B8%201',
};

export const mockPages: ScrapboxPageData[] = [
  mockPage,
  {
    id: 'page-2',
    title: 'テストページ 2',
    imageUrl: 'https://example.com/2.png',
    description: '説明文 2',
    updatedAt: '2024-01-15T00:00:00.000Z',
    url: 'https://scrapbox.io/test-project/%E3%83%86%E3%82%B9%E3%83%88%E3%83%9A%E3%83%BC%E3%82%B8%202',
  },
  {
    id: 'page-3',
    title: 'テストページ 3（画像なし）',
    imageUrl: null,
    description: '説明文 3',
    updatedAt: '2024-01-14T00:00:00.000Z',
    url: 'https://scrapbox.io/test-project/%E3%83%86%E3%82%B9%E3%83%88%E3%83%9A%E3%83%BC%E3%82%B8%203',
  },
  {
    id: 'page-4',
    title: 'テストページ 4',
    imageUrl: 'https://example.com/4.png',
    description: 'これは非常に長い説明文です。'.repeat(10),
    updatedAt: '2024-01-13T00:00:00.000Z',
    url: 'https://scrapbox.io/test-project/%E3%83%86%E3%82%B9%E3%83%88%E3%83%9A%E3%83%BC%E3%82%B8%204',
  },
  {
    id: 'page-5',
    title: 'テストページ 5',
    imageUrl: 'https://example.com/5.png',
    description: '説明文 5',
    updatedAt: '2024-01-12T00:00:00.000Z',
    url: 'https://scrapbox.io/test-project/%E3%83%86%E3%82%B9%E3%83%88%E3%83%9A%E3%83%BC%E3%82%B8%205',
  },
];

export const mockScrapboxData: ScrapboxDataFile = {
  projectName: 'test-project',
  fetchedAt: '2024-01-17T00:00:00.000Z',
  pages: mockPages,
};

export const emptyScrapboxData: ScrapboxDataFile = {
  projectName: 'empty-project',
  fetchedAt: '2024-01-17T00:00:00.000Z',
  pages: [],
};
```

---

## 7. MSW ハンドラー

```typescript
// src/__tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockScrapboxData, emptyScrapboxData } from '../fixtures/scrapbox';

export const handlers = [
  // 正常系
  http.get('/data/scrapbox-test-project.json', () => {
    return HttpResponse.json(mockScrapboxData);
  }),

  // 空データ
  http.get('/data/scrapbox-empty-project.json', () => {
    return HttpResponse.json(emptyScrapboxData);
  }),

  // 404
  http.get('/data/scrapbox-not-found-project.json', () => {
    return new HttpResponse(null, { status: 404 });
  }),

  // ネットワークエラー
  http.get('/data/scrapbox-error-project.json', () => {
    return HttpResponse.error();
  }),

  // 不正な JSON
  http.get('/data/scrapbox-invalid-project.json', () => {
    return HttpResponse.text('invalid json');
  }),
];
```

---

## 8. テストセットアップ

```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';
import { afterAll, afterEach, beforeAll } from 'vitest';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 9. E2E テスト（Playwright）

### テストケース

| ID | テストケース | 確認項目 |
|----|-------------|---------|
| E2E-01 | カード一覧表示 | デモページでカードが表示される |
| E2E-02 | ホバーエフェクト | カードホバー時にスタイル変化 |
| E2E-03 | リンク動作 | クリックで新しいタブに Scrapbox ページ |
| E2E-04 | モバイル表示 | viewport 375px で 1 カラム |
| E2E-05 | タブレット表示 | viewport 768px で 2 カラム |
| E2E-06 | デスクトップ表示 | viewport 1280px で 3 カラム |
| E2E-07 | 画像遅延読み込み | スクロールで画像がフェードイン |

### サンプルコード

```typescript
// e2e/scrapbox-card-list.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ScrapboxCardList', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scrapbox');
  });

  test('E2E-01: カード一覧が表示される', async ({ page }) => {
    await expect(page.getByTestId('scrapbox-card').first()).toBeVisible();
  });

  test('E2E-02: ホバー時にスタイルが変化する', async ({ page }) => {
    const card = page.getByTestId('scrapbox-card').first();
    await card.hover();
    // CSS の変化を確認（shadow, scale など）
  });

  test('E2E-03: カードクリックで Scrapbox ページが開く', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByTestId('scrapbox-card').first().click(),
    ]);
    await expect(newPage).toHaveURL(/scrapbox\.io/);
  });

  test('E2E-04: モバイルで 1 カラム表示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    // グリッドカラム数を確認
  });

  test('E2E-06: デスクトップで 3 カラム表示', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // グリッドカラム数を確認
  });
});
```

---

## 10. 要件カバレッジマトリクス

| 要件 ID | 要件概要 | テスト ID |
|---------|---------|----------|
| 1.1 | Scrapbox API からデータ取得 | BS-07 |
| 1.2 | JSON ファイル保存 | BS-07 |
| 1.3 | データ変換（タイトル、説明、URL 等） | BS-01〜06 |
| 1.4 | API 失敗時のエラーハンドリング | BS-08, BS-09 |
| 1.5 | 環境変数でプロジェクト名設定 | BS-10 |
| 2.1 | project prop | SCL-04 |
| 2.2 | limit prop | SCL-02 |
| 2.3 | client:load ハイドレーション | E2E-01 |
| 2.4 | project 未指定時エラー | SCL-04 |
| 3.1 | JSON fetch | USD-01 |
| 3.2 | ローディング状態 | SCL-03 |
| 3.3 | データ未存在エラー | SCL-07 |
| 3.4 | キャッシュ | USD-03, USD-04 |
| 4.1 | カードレイアウト | SC-01 |
| 4.2 | プレースホルダー画像 | SC-02 |
| 4.3 | 説明文省略 | SC-03 |
| 4.4 | ホバーエフェクト | SC-06, E2E-02 |
| 4.5 | 新しいタブで開く | SC-05, E2E-03 |
| 5.1 | レスポンシブ 3/2/1 カラム | SCL-08〜10, E2E-04〜06 |
| 5.2 | 画像アスペクト比維持 | SC-01 |
| 5.3 | タッチ操作対応 | E2E-03 |
| 6.1 | 0 件メッセージ | SCL-05 |
| 6.2 | リトライボタン | SCL-06 |
| 6.3 | データバリデーション | USD-07 |

---

## 11. vitest.config.ts

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/scrapbox/**',
        'src/hooks/**',
        'scripts/fetch-scrapbox.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```
