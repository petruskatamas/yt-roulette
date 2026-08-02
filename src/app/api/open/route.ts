import { bad, ok, readBody } from '@/server/http'
import { openIncognito } from '@/server/host'

export async function POST(req: Request) {
  const body = await readBody(req)
  const url = String(body.url ?? '')
  if (!/^https:\/\/www\.youtube\.com\//.test(url)) return bad(400, 'invalid url')
  openIncognito(url)
  return ok()
}
