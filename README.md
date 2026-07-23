# Learning Log App

学習内容と実装過程を記録し、理解できたこと・詰まったこと・次に取り組むことを整理する個人向けアプリです。

Laravel APIとNext.jsを分離した構成で、学習記録のCRUD（登録・一覧・詳細・編集・削除）を実装しています。CRUDとは、データを作成・取得・更新・削除する基本操作のことです。

## 主な機能

### 学習記録

- 学習記録の登録
- 新しい順に並ぶ一覧表示
- 1件の詳細表示
- 登録内容の編集
- 確認ダイアログ付きの削除
- 読み込み中・0件・404・通信失敗・入力エラーの表示
- Laravelのバリデーションエラーを各入力欄へ表示

記録できる内容は次のとおりです。

- 学習日
- 実現したいこと
- 今日やったこと
- 理解できたこと
- 詰まったところ
- 解決方法
- 条件整理
- 処理の分解
- 日本語の実装手順
- コード
- まだわからないこと
- 次にやること

### 学習支援ツール

- 実装設計トレーニング
  - CRUDの要件を日本語の処理手順、Laravelコード例、テスト観点へ変換
- フロント実装トレーニング
  - API設計をTypeScript型、state、通信処理、表示条件へ変換
- ページ・コンポーネント構成マップ
  - 複数アプリのページ、部品、画面間の導線をブラウザ内に保存
- 実装パターン辞書
  - Laravel API、Next.js、React、TypeScriptの定番処理を技術・用途から確認
  - 処理の短縮形、実装手順、条件分岐、確認項目、最小コード例を表示

学習支援ツールの入力内容は外部APIへ送信せず、ブラウザの`localStorage`へ保存します。

## 使用技術

- Laravel 13 / PHP 8.4
- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
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

Docker Desktopを起動し、WSL連携を有効にしてから実行します。

```bash
git clone https://github.com/lesser-fam/learning-log-app.git
cd learning-log-app
make setup
```

セットアップ後、次のURLを確認します。

- トップページ: http://localhost:4310
- 学習記録: http://localhost:4310/learning-logs
- 実装設計トレーニング: http://localhost:4310/design-trainer
- フロント実装トレーニング: http://localhost:4310/frontend-trainer
- コンポーネントマップ: http://localhost:4310/component-map
- 実装パターン辞書: http://localhost:4310/pattern-library
- Laravelヘルスチェック: http://localhost:8081/up
- phpMyAdmin: http://localhost:8082

phpMyAdminには、ルート直下の`.env`にある`DB_USERNAME`と`DB_PASSWORD`でログインできます。

## API

| メソッド | エンドポイント | 内容 |
|---|---|---|
| `GET` | `/api/learning-logs` | 一覧取得 |
| `POST` | `/api/learning-logs` | 新規登録 |
| `GET` | `/api/learning-logs/{id}` | 詳細取得 |
| `PATCH` | `/api/learning-logs/{id}` | 更新 |
| `DELETE` | `/api/learning-logs/{id}` | 削除 |

## 画面

| URL | 内容 |
|---|---|
| `/learning-logs` | 一覧 |
| `/learning-logs/create` | 登録 |
| `/learning-logs/{id}` | 詳細・削除 |
| `/learning-logs/{id}/edit` | 編集 |

登録画面と編集画面は、共通の`LearningLogForm`コンポーネントを使用しています。入力欄を追加・変更するときに、同じ修正を複数画面へ繰り返す必要がない構成です。

## よく使うコマンド

```bash
make up        # コンテナを起動
make down      # コンテナを停止
make logs      # ログを確認
make ps        # コンテナの状態を確認
make backend   # Laravelコンテナに入る
make frontend  # Next.jsコンテナに入る
make test      # Laravelテストを実行
make lint      # PHPとTypeScriptの静的チェック
make format    # PHPコードを整形
```

Next.jsの本番ビルド確認は次のコマンドで実行します。

```bash
docker compose exec frontend npm run build
```

## テスト対象

Laravel Feature Testでは、学習記録APIの以下の動作を確認しています。

- 登録成功・入力エラー
- 一覧取得と並び順
- 詳細取得・404
- 更新成功・入力エラー
- 削除成功・404

```bash
docker compose exec backend php artisan test
```

## 現在の利用範囲

このバージョンは、ローカル環境で自分が使うことを想定したMVPです。MVPとは、目的を満たす最小限の完成版のことです。

認証とユーザーごとのデータ分離はまだ実装していません。そのため、インターネットへ一般公開する場合は、公開前に認証・認可、CORS設定、環境変数、HTTPS、バックアップ方針を追加で確認する必要があります。

## 補足

- `make fresh`は開発用データをすべて削除します。必要なときだけ実行してください。
- `.env`には秘密情報が含まれるため、Gitへコミットしません。
