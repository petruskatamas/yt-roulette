import { lanIp } from '@/server/host'
import { json } from '@/server/http'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const port = new URL(req.url).port || '3000'
  return json({ joinBase: `http://${lanIp()}:${port}` })
}
