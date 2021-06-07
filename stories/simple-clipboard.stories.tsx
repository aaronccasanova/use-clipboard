import React from 'react'
import { Meta, Story } from '@storybook/react'
import { useClipboard } from '../src'

function SimpleClipboard() {
  const [text, setText] = React.useState('hi')

  const { status, writeText } = useClipboard({
    text,
    timeout: 2000,
  })

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h1>Simple Clipboard Example</h1>
      <h2>Copy Status: {status.copy}</h2>
      <h2>Transition Status: {status.transition}</h2>

      <br />

      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={writeText}>
        {status.copy === 'resolved' ? 'copied' : 'copy'}
      </button>

      <br />

      <h2>Paste Here:</h2>
      <input type="text" />
    </div>
  )
}

const meta: Meta = {
  title: 'Simple Clipboard',
  component: SimpleClipboard,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<{}> = args => <SimpleClipboard {...args} />

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({})

Default.args = {}
