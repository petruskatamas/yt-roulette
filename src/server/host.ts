import { spawn } from 'node:child_process'
import { networkInterfaces } from 'node:os'

// The address phones should join on — the TV itself usually sits on localhost.
export function lanIp(): string {
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
    }
  }
  return 'localhost'
}

function launch(cmd: string, args: string[], fallback?: () => void) {
  const started = Date.now()
  const child = spawn(cmd, args, { detached: true, stdio: 'ignore' })
  child.on('error', () => fallback?.())
  child.on('exit', (code) => {
    // only fall back on immediate failures, not on the browser closing later
    if (code !== 0 && Date.now() - started < 3000) fallback?.()
  })
  child.unref()
}

export function openIncognito(url: string) {
  const openDefault = () =>
    launch(
      process.platform === 'darwin'
        ? 'open'
        : process.platform === 'win32'
          ? 'explorer'
          : 'xdg-open',
      [url],
    )

  if (process.platform === 'darwin') {
    launch('open', ['-na', 'Google Chrome', '--args', '--incognito', url], openDefault)
  } else if (process.platform === 'win32') {
    launch('cmd', ['/c', 'start', 'chrome', '--incognito', url], openDefault)
  } else {
    launch('google-chrome', ['--incognito', url], openDefault)
  }
}
