# Animation Options

## Table of Contents

| Section | What You'll Learn |
|---------|-------------------|
| [Comparison Route](#comparison-route) | 実際に触って比較するページを確認する |
| [Evaluation Criteria](#evaluation-criteria) | アニメーションをどう評価するかを揃える |
| [Patterns](#patterns) | 比較対象の4案を把握する |
| [Initial Recommendation](#initial-recommendation) | 現時点の本命案と理由を確認する |

## Comparison Route

未リンクの検証用ページとして `/theme-animation-lab` を追加する。実ページのテーマ状態や `localStorage.theme` は変更せず、各プレビュー内だけでライト/ダークを反転させる。

## Evaluation Criteria

| Criterion | Meaning |
|-----------|---------|
| Quiet | 記事閲覧中に邪魔にならない静かさ |
| Clear | テーマが変わったことの分かりやすさ |
| Repeat | 何度押しても疲れない反復耐性 |

## Patterns

### Quiet Eclipse

- **Concept**: ボタンから夜と朝が静かに広がる
- **Motion**: ボタン中心の円形波。テーマ反映は波が半分ほど広がったタイミング。
- **Strength**: 操作点と画面変化の因果が分かりやすい。既存の波テストケースとも合う。
- **Risk**: 波の不透明度が高すぎると画面全体の点滅に見える。

### Paper Lantern

- **Concept**: 紙面に照明を落とす、または戻す
- **Motion**: 上から下への柔らかいワイプ。本文を紙面として扱う。
- **Strength**: ブログ本文とのメタファーが近く、落ち着いた印象になる。
- **Risk**: ボタン操作との起点関係がやや弱い。

### Ink Ripple

- **Concept**: インクの一滴が紙面に広がる
- **Motion**: ボタン付近から二重リップルと有機的な円が広がる。
- **Strength**: 印象に残りやすく、切替のイベント感が強い。
- **Risk**: 読書中に毎回見るには少し強い。

### Orbit Shift

- **Concept**: 太陽と月がボタンの周りで入れ替わる
- **Motion**: ボタン周辺だけで小さく軌道運動し、背景は短くクロスフェード。
- **Strength**: 最も控えめで、レイアウトへの影響が少ない。
- **Risk**: テーマが画面全体で変わる因果が弱く、地味に感じる可能性がある。

## Initial Recommendation

本命は **Quiet Eclipse**。理由は、既存の波演出を活かしつつ、読書体験を邪魔しない短さにできるため。次点は **Paper Lantern**。ブログの紙面感には合うが、ボタン起点の操作感は Quiet Eclipse の方が強い。
