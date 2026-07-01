const apiBase = process.env.API_BASE ?? 'http://localhost:4000'
const email = process.env.ADMIN_EMAIL ?? 'admin@donnalupe.com'
const password = process.env.ADMIN_PASSWORD ?? 'donnalupe123'
const demoBatch = process.env.DEMO_BATCH

function isDemoLandingContent(content) {
  if (content.page !== 'landing') return false
  if (content.section === 'Novidades Demo') return true
  if (typeof demoBatch === 'string' && demoBatch !== '' && String(content.name ?? '').startsWith(demoBatch)) return true
  return String(content.name ?? '').startsWith('Demo Landing ')
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, options)
  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} retornou ${response.status}: ${text}`)
  }

  return body
}

async function main() {
  const login = await request('/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const headers = {
    Authorization: `Bearer ${login.token}`,
  }

  const list = await request('/admin/page-contents', { headers })
  const targets = (list.contents ?? []).filter(isDemoLandingContent)

  if (targets.length === 0) {
    console.log('Nenhum conteúdo de demonstração da landing encontrado.')
    return
  }

  for (const item of targets) {
    await request(`/admin/page-contents/${item.id}`, {
      method: 'DELETE',
      headers,
    })

    console.log(`Removido: #${item.id} ${item.section} - ${item.title}`)
  }

  const publicLanding = await request('/page-contents/landing')
  const stillVisible = targets.filter((item) =>
    publicLanding.contents?.some((content) => content.id === item.id),
  )

  if (stillVisible.length > 0) {
    throw new Error(`Ainda existem conteúdos visíveis: ${stillVisible.map((item) => item.id).join(', ')}`)
  }

  console.log('')
  console.log(`Conteúdos removidos: ${targets.map((item) => item.id).join(', ')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
