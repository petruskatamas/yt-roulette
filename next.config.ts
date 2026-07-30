import { networkInterfaces } from 'node:os'
import type { NextConfig } from 'next'

// phones join over the LAN; without this, dev mode blocks their asset requests
const lanAddresses = Object.values(networkInterfaces())
  .flatMap((ifaces) => ifaces ?? [])
  .filter((iface) => iface.family === 'IPv4' && !iface.internal)
  .map((iface) => iface.address)

const nextConfig: NextConfig = {
  allowedDevOrigins: lanAddresses,
}

export default nextConfig
