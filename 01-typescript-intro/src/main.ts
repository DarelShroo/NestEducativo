import './style.css'

import { charmander } from './bases/04-injection.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Hello ${charmander.id}</h1>
`
