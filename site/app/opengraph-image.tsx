import { ImageResponse } from 'next/og'
export const alt = 'Tessure — Many signals. One clear picture. A physical security concept.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export default function Image() { return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: '#f3f2ed', color: '#244d41' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30 }}><span>tessure</span><span style={{ fontSize: 20 }}>A physical security concept</span></div><div style={{ display: 'flex', flexDirection: 'column', fontSize: 88, lineHeight: 1.05, letterSpacing: '-4px' }}><span>Many signals.</span><span>One clear picture.</span></div><div style={{ display: 'flex', fontSize: 23, borderTop: '1px solid #b6c2b5', paddingTop: 24 }}>Connected evidence. Human decisions. Six illustrative worlds.</div></div>, { ...size }) }
