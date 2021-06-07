import React from 'react'
import { Meta, Story } from '@storybook/react'
import { useClipboard } from '../src'

function ReadClipboard() {
  const [text, setText] = React.useState('hi')

  const { status, writeText, readText } = useClipboard({
    text,
    timeout: 2000,
  })

  const [clipboardText, setClipboardText] = React.useState('')

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h1>Read Clipboard Example</h1>
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
      <br />

      <input type="text" value={clipboardText} readOnly />
      <button onClick={async () => setClipboardText(await readText())}>
        read
      </button>
    </div>
  )
}

const meta: Meta = {
  title: 'Read Clipboard',
  component: ReadClipboard,
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

const Template: Story<{}> = args => <ReadClipboard {...args} />

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({})

Default.args = {}
