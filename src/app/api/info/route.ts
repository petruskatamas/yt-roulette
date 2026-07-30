import { lanIp } from '@/server/game'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const port = new URL(req.url).port || '3000'
  return Response.json({ joinBase: `http://${lanIp()}:${port}` })
}
