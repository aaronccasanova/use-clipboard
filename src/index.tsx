import React from 'react'

/**
 * Prevents updating state on an unmounted component.
 */
function useSafeSetState<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
) {
  const mounted = React.useRef(false)

  React.useLayoutEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  return React.useCallback(
    (action: React.SetStateAction<T>) => {
      if (mounted.current) setState(action)
    },
    [setState],
  )
}

/**
 * Statuses for the `status.copy` state.
 */
type CopyStatus = 'idle' | 'resolved' | 'rejected'

/**
 * Statuses for the `status.transition` state.
 *
 * Note: Using the same naming convention as the react-transition-group package.
 * http://reactcommunity.org/react-transition-group/transition#transition-prop-timeout
 */
type TransitionStatus = 'entering' | 'entered' | 'exiting' | 'exited'

/**
 * Transition statuses that accept custom timeout durations.
 */
type SequenceStatus = Exclude<TransitionStatus, 'exited'>

/**
 * Custom durations for each transition sequence status.
 */
type SequenceTimeout = {
  [S in SequenceStatus]?: number
}

/**
 * Content to write to the clipboard.
 */
type Text = string | number

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
  timeout?: number | SequenceTimeout
}

interface UseClipboardReturnType {
  readText(): Promise<string>
  writeText: (text?: Text | React.SyntheticEvent) => Promise<void>
  error: null | Error
  status: {
    copy: CopyStatus
    transition: TransitionStatus
  }
}

interface StatusState {
  copyStatus: CopyStatus
  transitionStatus: TransitionStatus
}

interface UseClipboardState extends StatusState {
  error: null | Error
}

type Durations = {
  [S in SequenceStatus]: number
}

const defaultDurations: Durations = {
  entering: 0,
  entered: 0,
  exiting: 0,
}

type NextStatusStates = {
  [S in SequenceStatus]: StatusState
}

const nextStatuses = {
  exited: 'entering',
  entering: 'entered',
  entered: 'exiting',
  exiting: 'exited',
} as const

/**
 * Default next status states for a `useClipboard` instance
 * with the `SequenceTimeout` options provided.
 */
const defaultNextStatusStates: NextStatusStates = {
  entering: {
    copyStatus: 'resolved',
    transitionStatus: 'entered',
  },
  entered: {
    copyStatus: 'resolved',
    transitionStatus: 'exiting',
  },
  exiting: {
    copyStatus: 'idle',
    transitionStatus: 'exited',
  },
}

/**
 * Returns the provided or next transition status with
 * a positive timeout integer.
 *
 * Note: This helps avoid excessively calling setState
 * and setTimeout throughout the implementation.
 */
const getTransitionStatus = (
  transitionStatus: TransitionStatus,
  nextStatusStates: NextStatusStates,
  durations: Durations
): TransitionStatus => {
  let status = transitionStatus
  let duration = 0

  while (status !== 'exited' && duration <= 0) {
    duration = durations[status]

    if (duration <= 0) {
      status = nextStatusStates[status].transitionStatus
    }
  }

  return status
}

const defaultState: UseClipboardState = {
  error: null,
  copyStatus: 'idle',
  transitionStatus: 'exited',
}

export function useClipboard(
  options: UseClipboardOptions
): UseClipboardReturnType {
  const [state, setState] = React.useState<UseClipboardState>(defaultState)

  const safeSetState = useSafeSetState(setState)

  /**
   * Faux deep equality check if `options.timeout` is an unmemoized object.
   */
  const hasTimeoutChange = React.useMemo(() => {
    const timeout = options.timeout

    if (typeof timeout === 'object') {
      return `${timeout['entering']}${timeout['entered']}${timeout['exiting']}`
    }

    return timeout
  }, [options.timeout])

  /**
   * Durations for each transition status.
   */
  const durations: Durations = React.useMemo(
    () =>
      typeof options.timeout === 'object'
        ? {
            entering: options.timeout?.entering ?? 0,
            entered: options.timeout?.entered ?? 0,
            exiting: options.timeout?.exiting ?? 0,
          }
        : {
            ...defaultDurations,
            entered: options.timeout ?? 0,
          },
    [hasTimeoutChange]
  )

  /**
   * Mapping of next states applied in the setTimeout effect.
   */
  const nextStatusStates: NextStatusStates = React.useMemo(
    () =>
      typeof options.timeout === 'object'
        ? defaultNextStatusStates
        : {
            ...defaultNextStatusStates,
            entered: {
              copyStatus: 'idle',
              transitionStatus: 'exited',
            },
          },
    [hasTimeoutChange]
  )

  const writeText = React.useCallback(
    async (text?: Text | React.SyntheticEvent) => {
      try {
        // Exit early if the transition sequence is in progress.
        if (state.transitionStatus !== 'exited') return

        const clipboardText =
          typeof text === 'string' || typeof text === 'number'
            ? text.toString()
            : options.text?.toString() || ''

        // Exit early if the clipboard text is empty.
        if (!clipboardText) return

        await navigator.clipboard.writeText(clipboardText)

        const transitionStatus = getTransitionStatus(
          nextStatuses[state.transitionStatus],
          nextStatusStates,
          durations
        )

        // Exit early if there are no transition sequences.
        if (transitionStatus === 'exited') return

        safeSetState({
          error: null,
          copyStatus: 'resolved',
          transitionStatus,
        })
      } catch (error) {
        safeSetState({
          error,
          copyStatus: 'rejected',
          transitionStatus: 'exited',
        })
      }
    },
    [options.text, nextStatusStates, durations]
  )

  /**
   * Effect that processes the transition sequence.
   */
  React.useEffect(() => {
    // Exit early if we are in the resting transition state.
    if (state.transitionStatus === 'exited') return

    const transitionStatus = getTransitionStatus(
      state.transitionStatus,
      nextStatusStates,
      durations
    )

    // Reset the default state if there are no more transition sequences.
    if (transitionStatus === 'exited') {
      safeSetState(defaultState)
      return
    }

    const timeoutId = setTimeout(() => {
      const nextStatusState = nextStatusStates[transitionStatus]

      safeSetState({
        error: null,
        copyStatus: nextStatusState.copyStatus,
        transitionStatus: nextStatusState.transitionStatus,
      })
    }, durations[transitionStatus])

    return () => {
      clearTimeout(timeoutId)
    }
  }, [state, nextStatusStates, durations])

  return {
    writeText,
    // TODO: Perhaps return void and add a `text` value to state.
    readText: async () => await navigator.clipboard.readText(),
    error: state.error,
    status: {
      copy: state.copyStatus,
      transition: state.transitionStatus,
    },
  }
}

export default useClipboard
