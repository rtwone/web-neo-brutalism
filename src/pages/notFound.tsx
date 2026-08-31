export function NotFoundPage({ language }: { language: 'en' | 'id' }) {
    const isId = language === 'id'

    return (
        <main className="not-found-page">
            <div className="not-found-card">
                <span className="eyebrow">404 / {isId ? 'Tidak Ditemukan' : 'Not Found'}</span>
                <h1>{isId ? 'Endpoint tidak tersedia.' : 'Endpoint is unavailable.'}</h1>
                <p>
                    {isId
                        ? 'Halaman yang kamu buka belum dibuat atau URL-nya salah.'
                        : 'The page you are trying to open does not exist or the URL is invalid.'}
                </p>
                <a className="button primary" href="/">
                    {isId ? 'Kembali ke beranda' : 'Go back home'} <span>↗</span>
                </a>
            </div>
        </main>
    )
}
