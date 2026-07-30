import { bad, ok, openIncognito, readBody } from '@/server/game'

export async function POST(req: Request) {
  const body = await readBody(req)
  const url = String(body.url ?? '')
  if (!/^https:\/\/www\.youtube\.com\//.test(url)) return bad(400, 'invalid url')
  openIncognito(url)
  return ok()
}
