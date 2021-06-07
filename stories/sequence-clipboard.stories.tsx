import React from 'react'
import { Meta, Story } from '@storybook/react'
import styled from 'styled-components'
import { useClipboard } from '../src'

const hoverDuration = 250

const Tooltip = styled.span<{ $on: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;  
  transform: translate(-50%, calc(-100% - 2px));
  background-color: #202020;
  color: snow;
  padding: 5px;
  opacity: ${props => props.$on ? 1 : 0};
  transition: opacity ${hoverDuration}ms;
`

const Button = styled.button`
  position: relative;

  &:hover ${Tooltip} {
    opacity: 1;
  }
`

function SequenceClipboard() {
  const [text, setText] = React.useState('hi')

  const { status, writeText} = useClipboard({
    text,
    timeout: {
      entering: 0,
      entered: 2000,
      exiting: hoverDuration,
    },
  })

  const isCopied = status.copy === 'resolved' && status.transition !== 'exiting'

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h1>Sequence Clipboard Example</h1>
      <h2>Basic Status: {status.copy}</h2>
      <h2>Transition Status: {status.transition}</h2>

      <br />

      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <Button onClick={writeText}>
        <Tooltip $on={isCopied}>
          {status.copy === 'idle' ? 'copy' : 'copied'}
        </Tooltip>
        {isCopied ? '✔️' : '📋'}
      </Button>

      <br />

      <h2>Paste Here:</h2>
      <input type="text" />
    </div>
  );
}

const meta: Meta = {
  title: 'Sequence Clipboard',
  component: SequenceClipboard,
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

const Template: Story<{}> = args => <SequenceClipboard {...args} />

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({})

Default.args = {}
