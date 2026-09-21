type Request = { method?: string }
type Response = { status: (status: number) => Response; setHeader: (name: string, value: string) => Response; json: (body: object) => void }

export default function handler(request: Request, response: Response) {
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })
    response.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
    return response.status(200).json({ success: true })
}
