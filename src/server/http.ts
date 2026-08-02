export const ok = () => Response.json({ ok: true })

export const json = <T>(data: T) => Response.json(data)

export const bad = (status: number, error: string) => Response.json({ error }, { status })

// Malformed or absent JSON bodies read as `{}` so handlers can validate fields uniformly.
export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}
