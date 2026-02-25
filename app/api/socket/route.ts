// Socket.io server for remote scene switching
// Next.js App Router doesn't support socket.io directly —
// this runs via a custom server. See server.ts at project root.

export async function GET() {
  return new Response("Use the custom server (npm run dev:socket)", {
    status: 200,
  });
}
