export default async () => {
  return Response.json({
    ok: true,
    service: "Horizon Home Display API"
  });
};

export const config = {
  path: "/api/health",
  method: ["GET"]
};
