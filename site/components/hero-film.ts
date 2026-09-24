// Original logistics-world film; times below are film edit boundaries, not product response times.
export const heroFilm = {
  "src": "/worlds/logistics-yard/intro.mp4",
  "poster": "/worlds/logistics-yard/intro-poster.webp",
  "posterAlt": "An amber-lit miniature logistics yard with a loaded tractor in the outbound lane beside dispatch and a closed barrier.",
  "duration": 12,
  "moments": [
    {
      "at": 0,
      "title": "Movement starts the question.",
      "detail": "Camera · a load approaches the outbound lane",
      "sources": 1
    },
    {
      "at": 4,
      "title": "Another view adds context.",
      "detail": "Camera, radar and proposed thermal",
      "sources": 3
    },
    {
      "at": 8,
      "title": "Context for human review.",
      "detail": "Linked observations · release still held",
      "sources": 3
    }
  ]
} as const
