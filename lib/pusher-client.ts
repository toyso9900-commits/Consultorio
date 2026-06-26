export function getPusherClientConfig() {
  return {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
  };
}

export function isPusherClientConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER);
}
