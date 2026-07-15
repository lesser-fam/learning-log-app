import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] px-5 py-10 text-slate-900 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 font-bold text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            L
          </span>
          Learning Log
        </div>

        <section className="mt-16 max-w-3xl">
          <p className="text-sm font-bold tracking-widest text-indigo-600">
            LEARN BY BUILDING
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
            考えた手順を、
            <br />
            自分のコードにする。
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">
            学習内容を記録しながら、APIの設計、処理の分解、実装、テストを一つずつ身につけるためのアプリです。
          </p>
        </section>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Link
            href="/design-trainer"
            className="group rounded-3xl bg-indigo-600 p-7 text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-1 hover:bg-indigo-700"
          >
            <span className="text-xs font-black tracking-widest text-indigo-200">
              DESIGN TRAINER
            </span>
            <h2 className="mt-4 text-2xl font-black">実装設計トレーニング</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-indigo-100">
              CRUDの設計項目を選び、日本語の処理手順・Laravelコード・テスト観点へ変換します。
            </p>
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold">
              はじめる{" "}
              <span className="transition group-hover:translate-x-1">→</span>
            </span>
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 text-slate-400 shadow-sm">
            <span className="text-xs font-black tracking-widest">
              LEARNING LOG
            </span>
            <h2 className="mt-4 text-2xl font-black text-slate-700">
              学習記録
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7">
              今日取り組んだこと、理解したこと、詰まったこと、次の行動を記録します。
            </p>
            <span className="mt-7 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
              これから実装
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
