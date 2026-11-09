module.exports = async (req, res) => {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return res.status(500).json({ error: "Clé API manquante (API_FOOTBALL_KEY)." });
  try {
    const r = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": key }
    });
    if (!r.ok) return res.status(502).json({ error: "L’API a répondu " + r.status + "." });
    const data = await r.json();
    const err = data.errors;
    if (err && (Array.isArray(err) ? err.length : Object.keys(err).length)) {
      return res.status(502).json({ error: "L’API a refusé la requête (clé ou quota)." });
    }
    const matches = (data.response || []).map(f => ({
      id: f.fixture.id, ligue: f.league.name,
      statut: f.fixture.status.short, minute: f.fixture.status.elapsed,
      dom: f.teams.home.name, ext: f.teams.away.name,
      sd: f.goals.home, se: f.goals.away
    }));
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=60");
    return res.status(200).json({ matches });
  } catch (e) {
    return res.status(502).json({ error: "Impossible de joindre l’API de football." });
  }
};
