export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/health') {
      const row = await env.DB.prepare('SELECT 1 AS ok').first()
      return Response.json({ ok: row.ok === 1 })
    }

    if (url.pathname === '/ranking') {
      const { results } = await env.DB.prepare(
        `SELECT u.display_name, SUM(s.points) AS points
         FROM workout_sessions s JOIN users u ON u.id = s.user_id
         WHERE s.created_at >= date('now', 'start of month')
         GROUP BY s.user_id ORDER BY points DESC LIMIT 20`
      ).all()
      return Response.json(results)
    }

    return new Response('Not found', { status: 404 })
  },
}
