// Entry point cho Mat Bảo Cloud Hosting
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Tạo Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

console.log('Starting Next.js application...')

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true)
      
      // Handle request với Next.js
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
  .listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${process.env.NODE_ENV}`)
  })
}).catch((ex) => {
  console.error('Failed to start application:', ex)
  process.exit(1)
})