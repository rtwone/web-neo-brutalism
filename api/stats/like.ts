import handler, { type VercelRequest, type VercelResponse } from '../stats.js'

export default async function likeHandler(request: VercelRequest, response: VercelResponse) {
    return handler({ ...request, query: { ...request.query, action: 'like' } }, response)
}
