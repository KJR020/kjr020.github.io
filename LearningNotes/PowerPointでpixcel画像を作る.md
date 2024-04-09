# PowerPointでpixcel指定のsvg画像を作る

## 経緯

SVG出力機能を作って、レイアウト画像を作りたい
powerpointはデフォルトで96ppi(pixcel per inchi)
日本語版はcm表示なので、96/2.54 cm/pixcel
2.54/96 pixcel/cm

800 pixcel x 600 pixcelの画像を作る場合、

800 * 2.54/96 = 21.166 cm
600 * 2.54/96 = 15.875 cm
