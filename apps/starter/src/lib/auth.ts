// Auth disabled stub
export const handlers = {
  GET: async () => new Response('Auth disabled', { status: 404 }),
  POST: async () => new Response('Auth disabled', { status: 404 })
};
export async function auth() {
  return null as any;
}
export async function signIn() {
  throw new Error('Auth disabled');
}
export async function signOut() {
  return;
}

