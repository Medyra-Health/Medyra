import { ImageResponse } from 'next/og'

export const size = { width: 48, height: 48 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#040C08',
          width: 48,
          height: 48,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#10B981',
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: 'Georgia, serif',
          }}
        >
          M
        </span>
      </div>
    ),
    { width: 48, height: 48 }
  )
}
