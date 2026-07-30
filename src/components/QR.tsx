import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QR({ text }: { text: string }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    QRCode.toDataURL(text, {
      margin: 1,
      width: 180,
      color: { dark: '#0b0d14', light: '#f5f0e6' },
    })
      .then(setSrc)
      .catch(() => {})
  }, [text])
  return src ? <img className="qr" src={src} alt={`QR code for ${text}`} /> : null
}
