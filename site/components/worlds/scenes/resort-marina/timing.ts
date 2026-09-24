export const T = {
  detect: 7, crossing: 17, verify: 18, airView: 23, correlate: 28, decide: 35,
  respond: 36, staffClear: 41, gateStart: 42, gateClosed: 46, visitorsSafe: 47,
  publicHeld: 50, boatTurn: 50, boatGo: 55, airExit: 57, resolve: 74,
  departed: 80, inspected: 83, publicOpen: 87, end: 94,
} as const
export const gatePivot: [number, number, number] = [12, 1.12, -1.7]
export const publicPivot: [number, number, number] = [8, 1.12, -1.7]
