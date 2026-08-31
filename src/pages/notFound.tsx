export function NotFoundPage() {
    return (
        <main className="not-found-page">
            <div className="not-found-card">
                <span className="eyebrow">404 / Not Found</span>
                <h1>Endpoint tidak tersedia.</h1>
                <p>Halaman yang kamu buka belum dibuat atau URL-nya salah.</p>
                <a className="button primary" href="/">
                    Kembali ke beranda <span>↗</span>
                </a>
            </div>
        </main>
    )
}
