import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {DraggableCore, DraggableData} from 'src/components/Layouts'
import Content from './Content'
import styles from './index.module.scss'

const MINWIDTH = 280
const MAXWIDTH = 280
const SHRINKWIDTH = 50

const LeftBar = memo(function LeftBar() {
  const [width, setWidth] = useState(MINWIDTH)
  const [shrinked] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const slackWidth = useRef(0)

  const resetData = useCallback(() => {
    slackWidth.current = 0
  }, [])

  const runConstraints = useCallback((w: number) => {
    const oldW = w
    w += slackWidth.current
    w = Math.max(MINWIDTH, w)
    w = Math.min(MAXWIDTH, w)
    slackWidth.current = slackWidth.current + oldW - w
    return w
  }, [])

  const onResize = useCallback(
    (ev: MouseEvent, {deltaX}: DraggableData) => {
      let newWidth = width + deltaX
      newWidth = runConstraints(newWidth)
      setWidth(newWidth)
    },
    [width],
  )

  const onResizeStop = useCallback(
    (ev: MouseEvent, data: DraggableData) => {
      resetData()
      onResize(ev, data)
    },
    [width],
  )

  const onResizeStart = useCallback(
    (ev: MouseEvent, data: DraggableData) => {
      resetData()
      onResize(ev, data)
    },
    [width],
  )

  useEffect(() => {
    if (!rootRef.current) return
    const siblingEl = rootRef.current.nextElementSibling as HTMLDivElement | null
    if (siblingEl) {
      const realWidth = shrinked ? SHRINKWIDTH : width
      Object.assign(siblingEl.style, {
        minWidth: `calc(100% - ${realWidth}px)`,
        maxWidth: `calc(100% - ${realWidth}px)`,
      })
    }
  }, [width, shrinked])

  const rootStyle = useMemo(() => {
    return {
      width: `${shrinked ? SHRINKWIDTH : width}px`,
    }
  }, [width, shrinked])

  // const onShrink = useCallback(
  //   (ev: React.MouseEvent<HTMLSpanElement>) => {
  //     ev.stopPropagation()
  //     setShrinked(!shrinked)
  //   },
  //   [shrinked],
  // )

  // const shrinkClass = useMemo(() => {
  //   return `${styles.shrink} ${shrinked ? styles.expand : undefined}`
  // }, [shrinked])

  return (
    <div ref={rootRef} className={styles.leftBar} style={rootStyle}>
      <Content />
      <DraggableCore onStop={onResizeStop} onStart={onResizeStart} onDrag={onResize}>
        <span className={styles.resizer} />
      </DraggableCore>
      {/* <span className={shrinkClass} onClick={onShrink} /> */}
    </div>
  )
})

export default LeftBar
