import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Spoonfed — Dinner, figured out.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #fff5f2 0%, #faf8f5 50%, #f6f7f4 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#ff5733',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '36px',
              fontWeight: 700,
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#4d4945',
            }}
          >
            Spoonfed
          </span>
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#ff5733',
            fontWeight: 600,
          }}
        >
          Dinner, figured out.
        </div>
        <div
          style={{
            fontSize: '20px',
            color: '#857e73',
            marginTop: '16px',
            maxWidth: '600px',
            textAlign: 'center',
          }}
        >
          Weekly meal plans built around what your family actually enjoys eating.
        </div>
      </div>
    ),
    { ...size }
  );
}
