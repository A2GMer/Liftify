# Liftify - Bench Press Workout Tracker

[English](#english) | [日本語](#japanese) | [Deutsch](#german) | [Français](#french)

---

## English

### 🏋️ Overview

Liftify is a cutting-edge fitness tracking web application that transforms personal workout experiences through intuitive design and advanced tracking technologies. Specifically designed for bench press enthusiasts, it provides comprehensive workout analytics, progress tracking, and personalized insights.

### ✨ Key Features

- **📊 Advanced Analytics**: Track your 1RM progression, daily volume, and comprehensive workout statistics
- **🌍 Multi-language Support**: Full internationalization with auto-detection (English, Japanese, French, German)
- **📱 Mobile-First Design**: Responsive touch-optimized interface for seamless mobile workouts
- **💳 Subscription Management**: Tiered plans (Free/Pro/Ultimate) with Stripe integration
- **🔐 Secure Authentication**: Multiple auth providers including AWS Cognito and Replit OAuth
- **⚡ Real-time Updates**: Live data synchronization and analytics
- **🎯 Detailed Set Tracking**: Track weight, reps, power belt usage, form focus, and failure points

### 🚀 Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for development and build
- Tailwind CSS + shadcn/ui components
- TanStack Query for state management
- Chart.js for data visualization

**Backend:**
- Node.js with Express.js
- AWS Lambda for serverless deployment
- PostgreSQL with Drizzle ORM
- Stripe for payment processing

**Infrastructure:**
- AWS Amplify for frontend hosting
- AWS RDS for database
- AWS API Gateway for API routing
- AWS Cognito for authentication

### 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/liftify.git
cd liftify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

### 🔧 Configuration

Create a `.env` file with the following variables:
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
```

### 📈 Usage

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Record Workouts**: Log your bench press sets with detailed metrics
3. **Track Progress**: View analytics, 1RM calculations, and volume trends
4. **Manage Subscription**: Upgrade to Pro or Ultimate for advanced features

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Japanese

### 🏋️ 概要

Liftifyは、直感的なデザインと先進的なトラッキング技術を通じて個人のワークアウト体験を変革する、最先端のフィットネストラッキングWebアプリケーションです。ベンチプレス愛好家のために特別に設計され、包括的なワークアウト分析、進捗追跡、個人向けインサイトを提供します。

### ✨ 主な機能

- **📊 高度な分析**: 1RM進捗、日別ボリューム、包括的なワークアウト統計を追跡
- **🌍 多言語対応**: 自動検出付き完全国際化（英語、日本語、フランス語、ドイツ語）
- **📱 モバイルファースト設計**: シームレスなモバイルワークアウト用のレスポンシブタッチ最適化インターフェース
- **💳 サブスクリプション管理**: Stripe統合による階層プラン（Free/Pro/Ultimate）
- **🔐 セキュアな認証**: AWS CognitoとReplit OAuthを含む複数の認証プロバイダー
- **⚡ リアルタイム更新**: ライブデータ同期と分析
- **🎯 詳細なセット追跡**: 重量、回数、パワーベルト使用、フォーカス、失敗ポイントを追跡

### 🚀 技術スタック

**フロントエンド:**
- React 18 with TypeScript
- Vite（開発とビルド）
- Tailwind CSS + shadcn/uiコンポーネント
- TanStack Query（状態管理）
- Chart.js（データ可視化）

**バックエンド:**
- Node.js with Express.js
- AWS Lambda（サーバーレスデプロイ）
- PostgreSQL with Drizzle ORM
- Stripe（決済処理）

**インフラストラクチャ:**
- AWS Amplify（フロントエンドホスティング）
- AWS RDS（データベース）
- AWS API Gateway（APIルーティング）
- AWS Cognito（認証）

### 📦 インストール

1. リポジトリをクローン:
```bash
git clone https://github.com/yourusername/liftify.git
cd liftify
```

2. 依存関係をインストール:
```bash
npm install
```

3. 環境変数を設定:
```bash
cp .env.example .env
# 設定で.envを編集
```

4. 開発サーバーを起動:
```bash
npm run dev
```

### 🔧 設定

以下の変数を含む`.env`ファイルを作成:
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
```

### 📈 使用方法

1. **サインアップ/ログイン**: アカウントを作成または既存の資格情報でログイン
2. **ワークアウト記録**: 詳細なメトリクスでベンチプレスセットを記録
3. **進捗追跡**: 分析、1RM計算、ボリューム傾向を表示
4. **サブスクリプション管理**: 高度な機能のためにProまたはUltimateにアップグレード

### 🤝 貢献

貢献を歓迎します！詳細は[貢献ガイド](CONTRIBUTING.md)をご覧ください。

### 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は[LICENSE](LICENSE)ファイルをご覧ください。

---

## German

### 🏋️ Überblick

Liftify ist eine hochmoderne Fitness-Tracking-Webanwendung, die persönliche Workout-Erfahrungen durch intuitives Design und fortschrittliche Tracking-Technologien transformiert. Speziell für Bankdrücken-Enthusiasten entwickelt, bietet es umfassende Workout-Analysen, Fortschrittsverfolgung und personalisierte Einblicke.

### ✨ Hauptfunktionen

- **📊 Erweiterte Analysen**: Verfolgen Sie Ihre 1RM-Progression, tägliches Volumen und umfassende Workout-Statistiken
- **🌍 Mehrsprachige Unterstützung**: Vollständige Internationalisierung mit Auto-Erkennung (Englisch, Japanisch, Französisch, Deutsch)
- **📱 Mobile-First Design**: Responsive Touch-optimierte Benutzeroberfläche für nahtlose mobile Workouts
- **💳 Abonnement-Management**: Gestufte Pläne (Free/Pro/Ultimate) mit Stripe-Integration
- **🔐 Sichere Authentifizierung**: Mehrere Auth-Anbieter einschließlich AWS Cognito und Replit OAuth
- **⚡ Echtzeit-Updates**: Live-Datensynchronisation und Analysen
- **🎯 Detaillierte Satz-Verfolgung**: Verfolgen Sie Gewicht, Wiederholungen, Powergürtel-Nutzung, Form-Fokus und Versagenspunkte

### 🚀 Tech Stack

**Frontend:**
- React 18 mit TypeScript
- Vite für Entwicklung und Build
- Tailwind CSS + shadcn/ui Komponenten
- TanStack Query für State Management
- Chart.js für Datenvisualisierung

**Backend:**
- Node.js mit Express.js
- AWS Lambda für Serverless-Deployment
- PostgreSQL mit Drizzle ORM
- Stripe für Zahlungsabwicklung

**Infrastruktur:**
- AWS Amplify für Frontend-Hosting
- AWS RDS für Datenbank
- AWS API Gateway für API-Routing
- AWS Cognito für Authentifizierung

### 📦 Installation

1. Repository klonen:
```bash
git clone https://github.com/yourusername/liftify.git
cd liftify
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Umgebungsvariablen einrichten:
```bash
cp .env.example .env
# .env mit Ihrer Konfiguration bearbeiten
```

4. Entwicklungsserver starten:
```bash
npm run dev
```

### 🔧 Konfiguration

Erstellen Sie eine `.env`-Datei mit den folgenden Variablen:
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
```

### 📈 Verwendung

1. **Registrieren/Anmelden**: Erstellen Sie ein Konto oder melden Sie sich mit bestehenden Anmeldedaten an
2. **Workouts aufzeichnen**: Protokollieren Sie Ihre Bankdrücken-Sätze mit detaillierten Metriken
3. **Fortschritt verfolgen**: Betrachten Sie Analysen, 1RM-Berechnungen und Volumen-Trends
4. **Abonnement verwalten**: Upgraden Sie zu Pro oder Ultimate für erweiterte Funktionen

### 🤝 Mitwirken

Wir begrüßen Beiträge! Bitte sehen Sie unseren [Beitragsleitfaden](CONTRIBUTING.md) für Details.

### 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE)-Datei für Details.

---

## Français

### 🏋️ Aperçu

Liftify est une application web de suivi de fitness de pointe qui transforme les expériences d'entraînement personnelles grâce à un design intuitif et des technologies de suivi avancées. Spécialement conçu pour les passionnés de développé couché, il fournit des analyses complètes d'entraînement, un suivi des progrès et des insights personnalisés.

### ✨ Fonctionnalités clés

- **📊 Analyses avancées**: Suivez votre progression 1RM, volume quotidien et statistiques complètes d'entraînement
- **🌍 Support multilingue**: Internationalisation complète avec détection automatique (anglais, japonais, français, allemand)
- **📱 Design Mobile-First**: Interface tactile responsive optimisée pour des entraînements mobiles fluides
- **💳 Gestion d'abonnement**: Plans étagés (Free/Pro/Ultimate) avec intégration Stripe
- **🔐 Authentification sécurisée**: Plusieurs fournisseurs d'auth incluant AWS Cognito et Replit OAuth
- **⚡ Mises à jour en temps réel**: Synchronisation de données en direct et analyses
- **🎯 Suivi détaillé des séries**: Suivez le poids, répétitions, utilisation de ceinture de force, focus de forme et points d'échec

### 🚀 Stack technique

**Frontend:**
- React 18 avec TypeScript
- Vite pour développement et build
- Tailwind CSS + composants shadcn/ui
- TanStack Query pour la gestion d'état
- Chart.js pour la visualisation de données

**Backend:**
- Node.js avec Express.js
- AWS Lambda pour déploiement serverless
- PostgreSQL avec Drizzle ORM
- Stripe pour traitement des paiements

**Infrastructure:**
- AWS Amplify pour hébergement frontend
- AWS RDS pour base de données
- AWS API Gateway pour routage API
- AWS Cognito pour authentification

### 📦 Installation

1. Cloner le dépôt:
```bash
git clone https://github.com/yourusername/liftify.git
cd liftify
```

2. Installer les dépendances:
```bash
npm install
```

3. Configurer les variables d'environnement:
```bash
cp .env.example .env
# Éditer .env avec votre configuration
```

4. Démarrer le serveur de développement:
```bash
npm run dev
```

### 🔧 Configuration

Créez un fichier `.env` avec les variables suivantes:
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
```

### 📈 Utilisation

1. **S'inscrire/Se connecter**: Créez un compte ou connectez-vous avec des identifiants existants
2. **Enregistrer les entraînements**: Enregistrez vos séries de développé couché avec des métriques détaillées
3. **Suivre les progrès**: Consultez les analyses, calculs 1RM et tendances de volume
4. **Gérer l'abonnement**: Passez à Pro ou Ultimate pour des fonctionnalités avancées

### 🤝 Contribuer

Nous accueillons les contributions! Veuillez consulter notre [Guide de contribution](CONTRIBUTING.md) pour plus de détails.

### 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📸 Screenshots

![Liftify Dashboard](./docs/screenshots/dashboard.png)
![Workout Recording](./docs/screenshots/workout-recording.png)
![Analytics](./docs/screenshots/analytics.png)

## 🌐 Live Demo

Visit our live application: [https://liftify.app](https://liftify.app)

## 📞 Support

For support, email support@liftify.app or join our [Discord community](https://discord.gg/liftify).

---

Made with ❤️ by the Liftify Team