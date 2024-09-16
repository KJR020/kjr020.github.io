+++
title = 'StreamDiffusion論文を読んでみる'
date = 2024-09-16T16:23:49+09:00
draft = true
+++

じつは、大垣で開催されるメイカーフェアミニに出典を申し込んでいる。
Stable Diffusionをパイプラインレベルで高速化した, StreamDiffusionという画像生成技術を組み込む予定をしている。
ここ数日、StreamDiffusionの元論文を読みはじめた。せっかくなので論文を読んだ際のメモを残しておく。  
論文は、arXivで公開されている。  
<https://arxiv.org/abs/2312.12491>

内容には誤りを含む可能性があるので、もしこの記録を読んでいる人がいれば容赦いただきたい。
そして、もし誤りを見つけた場合は、教えていただきたい。

## Abstractをよむ

- StreamDiffusionは、Stable Diffusionをパイプラインレベルで高速化する手法である。
  - 一般的に高速化はモデルレベルで行われてきた
  - `denoising step`のステップ数を削減するアプローチが主流(らしい)
- モデルでは、RCFG(Residual Classifier Free Guidance)というアルゴリズムを提唱
  - 従来のCFGに対して最大2.05倍の高速化を実現
- Stochastic Similarity filtering
  - 確率的にフィルターする技術？
  - GPUの電力消費を向上
- img2imgのタスクで、91.07fpsを達成したらしい。
