# GamePicker

僕が所有するゲームをおおよその同時接続プレイヤー数順にソートして表示するWebアプリです。

# 開発上の注意点

- Next.js@14.2.1の時点で、import.metaとの相性が非常に悪いです。直接あるいはパッケージを通じて間接的に利用しているものがあるとVercel上で動かなくなります。回避策として、`babel-plugin-transform-import-meta`を使用して排除しています。オプションで`ES6`を指定しないと変換がバグるので注意。
- next/fontはBabelと併用するとコンパイルエラーになるため排除しています
