const express = require('express')
const app = express()
const port = 3008

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.static(__dirname))

app.listen(port, () => {
  console.log(`Open http://localhost:${port}/ch08/PointLightedCube_perFragmant to test.`)
})