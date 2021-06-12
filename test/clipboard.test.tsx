import React from 'react'
import * as ReactDOM from 'react-dom'
import { Default as SimpleClipboard } from '../stories/simple-clipboard.stories'

describe('SimpleClipboard', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<SimpleClipboard />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})
