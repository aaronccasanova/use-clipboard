# use-clipboard 

React hook wrapping the Web Clipboard API.

## Usage

```bash
npm install use-clipboard 
```

```tsx
import { useClipboard } from 'use-clipboard'
```

## usePortal Options

```tsx
interface UseClipboardOptions {
  /**
   * Content to write to the clipboard.
   */
  text?: Text
  /**
   * Duration for the transition sequence.
   *
   * Note: If a `number` is provided it will only apply to the
   * `entered` transition state.
   */
  timeout?: number | {
    entering?: number
    entered?: number
    exiting?: number
  }
}
```

## useClipboard ReturnType

```tsx
interface UseClipboardReturnType {
  /**
   * Resolves with a copy of the textual contents of the system clipboard.
   */
  readText(): Promise<string>
  /**
   * Writes the text specified in the UseClipboardOptions or the first
   * argument of the function to the system clipboard.
   */
  writeText: (text?: Text | React.SyntheticEvent) => Promise<void>
  /**
   * Any error thrown while writing to or reading from the clipboard.
   */
  error: null | Error
  status: {
    /**
     * Various states for the writeText function.
     *
     * Commonly used for a simple indicator that text has been copied to
     * the clipboard.
     *
     * Note: The `resolve` state will persist for the duration of the timeout.
     */
    copy: 'idle' | 'resolved' | 'rejected'
    /**
     * Various states for the writeText function.
     * 
     * Commonly use for a sequenced indicator that text has been copied to
     * the clipboard.
     */
    transition: 'entering' | 'entered' | 'exiting' | 'exited'
  }
}
```

### Example: Simple Copy To Clipboard

[Demo](https://1pb5m.csb.app/) • [Code Sandbox](https://codesandbox.io/s/simple-notification-1pb5m)

```tsx
import { useClipboard } from 'use-clipboard'

function App() {
  const [text, setText] = React.useState('hi')

  const { status, writeText } = useClipboard({
    text,
    timeout: 2000,
  })

  return (
    <div>
      <h1>Simple Copy To Clipboard</h1>
      <h2>Copy Status: {status.copy}</h2>
      <h2>Transition Status: {status.transition}</h2>

      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={writeText}>
        {status.copy === 'resolved' ? 'copied' : 'copy'}
      </button>

      <h2>Paste Here:</h2>
      <input type="text" />
    </div>
  )
}
```

### Example: Sequenced Copy To Clipboard

[Demo](https://e284g.csb.app/) • [Code Sandbox](https://codesandbox.io/s/stacked-notification-e284g)

```tsx
import { useClipboard } from 'use-clipboard'

function App() {
  const [text, setText] = React.useState('hi')

  const { status, writeText } = useClipboard({
    text,
    timeout: {
      entered: 2000,
      exiting: 250,
    },
  })

  const isCopied = (
    status.copy === 'resolved' && status.transition !== 'exiting'
  )

  return (
    <div>
      <h1>Sequence Copy Clipboard</h1>
      <h2>Basic Status: {status.copy}</h2>
      <h2>Transition Status: {status.transition}</h2>

      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <Button onClick={writeText}>
        <Tooltip $on={isCopied}>
          {status.copy === 'resolved' ? 'copied' : 'copy'}
        </Tooltip>
        {isCopied ? '✔️' : '📋'}
      </Button>

      <h2>Paste Here:</h2>
      <input type="text" />
    </div>
  )
}
```

### Example: Simple Read From Clipboard

[Demo](https://gx5wl.csb.app/) • [Code Sandbox](https://codesandbox.io/s/replace-notification-gx5wl)

```tsx
import { useClipboard } from 'use-clipboard'

function App() {
  const [text, setText] = React.useState('hi')

  const { status, writeText, readText } = useClipboard({
    text,
    timeout: 2000,
  })

  const [clipboardText, setClipboardText] = React.useState('')

  return (
    <div>
      <h1>Read From Clipboard</h1>

      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={writeText}>
        {status.copy === 'resolved' ? 'copied' : 'copy'}
      </button>

      <input type="text" value={clipboardText} readOnly />
      <button onClick={async () => setClipboardText(await readText())}>
        read
      </button>
    </div>
  )
}
```