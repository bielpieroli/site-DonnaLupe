const apiBase = process.env.API_BASE ?? 'http://localhost:4000'
const email = process.env.ADMIN_EMAIL ?? 'admin@donnalupe.com'
const password = process.env.ADMIN_PASSWORD ?? 'donnalupe123'
const batch = process.env.DEMO_BATCH ?? `Demo Landing ${Date.now()}`

const records = [
  {
    page: 'landing',
    name: `${batch} lead`,
    section: 'Novidades Demo',
    title: 'Uma seção criada ao vivo',
    subtitle: 'Conteúdo dinâmico',
    description: 'Este bloco foi inserido pela API de conteúdos e aparece como uma seção extra na landing page.',
    image: 'cookie-morango.jpg',
    buttonText: 'Ver cardápio',
    buttonLink: '/shopping',
    status: 'Ativo',
  },
  {
    page: 'landing',
    name: `${batch} card cookie`,
    section: 'Novidades Demo',
    title: 'Cookie especial',
    subtitle: 'Destaque',
    description: 'Card de apoio criado para demonstrar múltiplos conteúdos dentro da mesma seção.',
    image: 'cookie-choco-chunk.jpg',
    buttonText: 'Comprar',
    buttonLink: '/shopping',
    status: 'Ativo',
  },
  {
    page: 'landing',
    name: `${batch} card coffee`,
    section: 'Novidades Demo',
    title: 'Coffee break sob medida',
    subtitle: 'Eventos',
    description: 'Segundo card da seção dinâmica para validar layout, imagem e chamada para ação.',
    image: 'coffebreak.jpg',
    buttonText: 'Conhecer',
    buttonLink: '/coffee',
    status: 'Ativo',
  },
]

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
    'Content-Type': 'application/json',
    Authorization: `Bearer ${login.token}`,
  }

  const created = []

  for (const payload of records) {
    const body = await request('/admin/page-contents', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    created.push(body.content)
    console.log(`Criado: #${body.content.id} ${body.content.section} - ${body.content.title}`)
  }

  const publicLanding = await request('/page-contents/landing')
  const allVisible = created.every((item) =>
    publicLanding.contents?.some((content) => content.id === item.id && content.status === 'Ativo'),
  )

  if (!allVisible) {
    throw new Error('Os conteúdos foram criados, mas nem todos apareceram no endpoint público da landing.')
  }

  console.log('')
  console.log(`Lote criado: ${batch}`)
  console.log(`IDs: ${created.map((item) => item.id).join(', ')}`)
  console.log('Abra http://localhost:5173 para ver a seção "Novidades Demo" na landing page.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
