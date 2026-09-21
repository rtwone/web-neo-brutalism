import { checkGlobalRateLimit } from '../lib/rate-limit.js'
import { getRequestSignals } from '../lib/visitor.js'
import { getStoredContactEmail } from '../lib/content.js'

export type VercelRequest = {
    method?: string
    body?: Record<string, unknown>
    headers?: Record<string, string | string[] | undefined>
}

export type VercelResponse = {
    status: (status: number) => VercelResponse
    json: (body: object) => void
    setHeader: (name: string, value: string) => void
}

declare const process: {
    env: Record<string, string | undefined>
}

const json = (response: VercelResponse, status: number, body: object) => {
    response.status(status).json(body)
}

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const rate = checkGlobalRateLimit(getRequestSignals(request).ip)
    if (!rate.allowed) {
        response.setHeader('Retry-After', String(rate.retryAfter))
        return json(response, 429, { error: 'Too many requests' })
    }

    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST')
        return json(response, 405, { error: 'Method not allowed' })
    }

    const { name, email, subject, message } = request.body ?? {}

    if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof subject !== 'string' ||
        typeof message !== 'string' ||
        !name.trim() ||
        !email.trim() ||
        !subject.trim() ||
        !message.trim()
    ) {
        return json(response, 400, { error: 'All fields are required' })
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL
    let to = process.env.CONTACT_TO_EMAIL
    try {
        to = await getStoredContactEmail() || to
    } catch {
        // Keep the environment fallback available if CMS storage is unavailable.
    }

    if (!apiKey || !from || !to) {
        return json(response, 500, { error: 'Email service is not configured' })
    }

    const safeName = escapeHtml(name.trim())
    const safeEmail = escapeHtml(email.trim())
    const safeSubject = escapeHtml(subject.trim())
    const safeMessage = escapeHtml(message.trim())

    try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to: [to],
                reply_to: email.trim(),
                subject: `[Portfolio] ${subject.trim()}`,
                text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
                html: `
                    <div style="margin:0;background:#f4f1e9;padding:32px 16px;font-family:Arial,sans-serif;color:#141414;">
                        <div style="max-width:620px;margin:0 auto;background:#fffdf7;border:2px solid #141414;box-shadow:6px 6px 0 #141414;">
                            <div style="background:#f26a3d;border-bottom:2px solid #141414;padding:26px 28px;">
                                <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">IRFAN HARIYANTO</div>
                                <h1 style="margin:22px 0 0;font-size:30px;line-height:1.05;letter-spacing:-1px;">New message from your portfolio</h1>
                            </div>
                            <div style="padding:28px;">
                                <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#696763;margin-bottom:8px;">Message details</div>
                                <table role="presentation" style="width:100%;border-collapse:collapse;border-top:2px solid #141414;border-bottom:2px solid #141414;margin-bottom:26px;">
                                    <tr><td style="padding:12px 0;font-size:12px;color:#696763;width:110px;">FROM</td><td style="padding:12px 0;font-size:14px;font-weight:bold;">${safeName}</td></tr>
                                    <tr><td style="padding:12px 0;font-size:12px;color:#696763;">EMAIL</td><td style="padding:12px 0;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#141414;">${safeEmail}</a></td></tr>
                                    <tr><td style="padding:12px 0;font-size:12px;color:#696763;">SUBJECT</td><td style="padding:12px 0;font-size:14px;font-weight:bold;">${safeSubject}</td></tr>
                                </table>
                                <div style="background:#f4f1e9;border-left:5px solid #8cc7ff;padding:18px 20px;white-space:pre-wrap;font-size:15px;line-height:1.6;">${safeMessage}</div>
                                <a href="mailto:${safeEmail}?subject=Re: ${safeSubject}" style="display:inline-block;margin-top:26px;background:#141414;color:#fffdf7;padding:14px 18px;text-decoration:none;font-weight:bold;font-size:12px;text-transform:uppercase;">Reply to ${safeName} &rarr;</a>
                            </div>
                            <div style="border-top:2px solid #141414;padding:16px 28px;font-size:11px;color:#696763;">Sent from irfanhariyanto.com contact form</div>
                        </div>
                    </div>
                `,
            }),
        })

        if (!resendResponse.ok) {
            return json(response, 502, { error: 'Unable to send email' })
        }

        return json(response, 200, { success: true })
    } catch {
        return json(response, 502, { error: 'Unable to reach email service' })
    }
}
