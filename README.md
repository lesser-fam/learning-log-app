# Learning Log App

学習内容と実装過程を記録し、理解できたこと・詰まったこと・次に取り組むことを整理するアプリです。

このリポジトリは、Laravel APIとNext.js画面を分けた構成です。

## 使用技術

- Laravel 13 / PHP 8.4
- Next.js 16 / TypeScript / Tailwind CSS
- MySQL 8.4
- Nginx
- Docker Compose

## ディレクトリ構成

```text
learning-log-app/
├── backend/             # Laravel API
├── frontend/            # Next.js
├── docker/
│   ├── backend/
│   ├── frontend/
│   └── nginx/
├── compose.yaml
├── Makefile
└── README.md
```

## 初回セットアップ

前提として、Docker DesktopのWSL連携を有効にしてください。

```bash
git clone https://github.com/lesser-fam/learning-log-app.git
cd learning-log-app
make setup
```

セットアップ後、次のURLを確認します。

- Next.js: http://localhost:3000
- 実装設計トレーニング: http://localhost:3000/design-trainer
- Laravel: http://localhost:8081/up
- APIヘルスチェック: http://localhost:8081/api/health
- phpMyAdmin: http://localhost:8082

phpMyAdminには、ルート直下の`.env`にある`DB_USERNAME`と`DB_PASSWORD`でログインできます。

## よく使うコマンド

```bash
make up        # コンテナを起動
make down      # コンテナを停止
make logs      # ログを確認
make ps        # コンテナの状態を確認
make backend   # Laravelコンテナに入る
make frontend  # Next.jsコンテナに入る
make test      # Laravelのテストを実行
make lint      # PHPとTypeScriptの静的チェック
make format    # PHPコードを整形
```

## 環境構築後の学習範囲

環境構築では、学習記録を登録する機能を実装していません。次のファイルや処理は、言語化から始めて自分で実装する練習範囲です。

- `learning_logs`テーブルの設計
- マイグレーション
- Eloquent Model
- FormRequestによる入力検証
- Controller
- `POST /api/learning-logs`
- Next.jsの登録フォーム

最初の目標は「学習記録を1件登録するAPI」です。いきなりコードを書かず、完成条件と処理手順を日本語で整理してから着手します。

## 実装設計トレーニング

`index`、`store`、`show`、`update`、`destroy`から実装したいメソッドを選び、一般的なAPI設計項目をフォームで整理できます。

- リクエストボディ、FormRequest、認証、所有者確認
- 検索条件、並び順、第2ソート、ページネーション
- 関連データの取得、更新方法、物理削除・論理削除
- 成功レスポンスとHTTPステータス

入力内容から、次の内容をブラウザ内で生成します。外部APIやAIサービスへの送信は行いません。

- 日本語の処理手順
- LaravelのRoute、FormRequest、Controllerのコード例
- よくある正常系、異常系、境界値、権限テスト
- Laravel Feature Testのコード例

コード例は初期状態では折りたたまれています。先に日本語の処理手順から実装を考え、必要になったときだけ開いて答え合わせに使用します。

## 補足

- Laravelのセッション、キャッシュ、キューは、機能用テーブルを作る前でも起動できる構成にしています。
- `make fresh`は開発用データをすべて削除します。必要なときだけ実行してください。
- `.env`には秘密情報が含まれるため、Gitへコミットしません。
