import { sum } from 'lodash'
import React from 'react'
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  StyleSheet,
  View,
  ViewStyle,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native'

interface IProps {
  start: number
  end: number
  step?: number
  defaultValue?: number
  disabled?: boolean
  style?: ViewStyle
  onChange?: (value: number) => void
  renderBar?: (value: number, index: number) => JSX.Element
  renderPointer?: () => JSX.Element
  onSlidingStart?: () => void
  onSlidingEnd?: () => void
}

const Ruler = ({
  start = 0,
  end = 100,
  step = 1,
  defaultValue,
  style,
  onChange,
  renderBar,
  renderPointer,
  onSlidingStart,
  onSlidingEnd,
}: IProps) => {
  const panX = React.useRef(new Animated.Value(0))
  const posX = React.useRef(0)
  const layoutWidths = React.useRef<number[]>([])
  const width = React.useRef(Dimensions.get('window').width / 2)
  const maxWidthRef = React.useRef(0)
  const slowPanRef = React.useRef<number | boolean>(0)
  const currentValue = React.useRef(0)
  const init = React.useRef(false)

  const arr = React.useMemo(() => {
    const steps: number[] = []
    for (let i = start; i <= end; i += step) {
      steps.push(i)
    }
    return steps
  }, [start, end, step])

  const onContainerLayout = (e: LayoutChangeEvent) => {
    width.current = e.nativeEvent.layout.width / 2
  }

  const onGestureEvent = (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { dx: translationX } = gestureState

    const toValue = translationX + posX.current
    const maxWidth = maxWidthRef.current || sum(layoutWidths.current) - width.current
    if ((toValue < width.current && toValue > -maxWidth) || typeof slowPanRef.current === 'number') {
      Animated.timing(panX.current, {
        toValue: typeof slowPanRef.current === 'number' ? slowPanRef.current + translationX * 0.4 : toValue,
        duration: 0,
        useNativeDriver: true,
      }).start()
    }
    if (toValue < width.current && toValue > -maxWidth) {
      slowPanRef.current = false
    }
    const x = -toValue + width.current
    let value = 0

    if (x > 0 && x < maxWidth + width.current) {
      let currWidth = 0
      arr.some((item) => {
        if (x > currWidth && x <= currWidth + layoutWidths.current[item]) {
          value = item
          return true
        }
        currWidth += layoutWidths.current[item]
        return false
      })
    } else if (x >= maxWidth + width.current) {
      value = arr[arr.length - 1]
    }
    if (value !== currentValue.current) {
      currentValue.current = value
      onChange?.(value)
    }
  }
  const onGestureEnd = (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const maxWidth = maxWidthRef.current || sum(layoutWidths.current) - width.current
    maxWidthRef.current = maxWidth
    const { dx: translationX } = gestureState
    const toValue = translationX + posX.current
    if (toValue > width.current || toValue < -maxWidth) {
      posX.current = toValue > width.current ? width.current : -maxWidth
      slowPanRef.current = toValue > width.current ? width.current : -maxWidth
      Animated.spring(panX.current, {
        toValue:
          -(toValue > width.current
            ? layoutWidths.current[arr[0]] / 2
            : sum(layoutWidths.current.slice(0, -1)) + layoutWidths.current[arr[arr.length - 1]] / 2) + width.current,
        useNativeDriver: true,
      }).start()
    } else {
      posX.current += translationX
      slowPanRef.current = false
      const x = -posX.current + width.current
      let value = layoutWidths.current[arr[0]] / 2
      let currWidth = 0
      arr.some((item) => {
        if (x > currWidth && x <= currWidth + layoutWidths.current[item]) {
          value = currWidth + layoutWidths.current[item] / 2
          return true
        }
        currWidth += layoutWidths.current[item]
        return false
      })
      Animated.spring(panX.current, {
        toValue: -value + width.current,
        useNativeDriver: true,
      }).start()
    }
    onSlidingEnd?.()
  }
  const onBarLayout = (e: LayoutChangeEvent, item: number) => {
    layoutWidths.current[item] = e.nativeEvent.layout.width
    if (!init.current && layoutWidths.current.length === arr.length) {
      init.current = true
      setTimeout(() => {
        let value = 0
        arr.some((i) => {
          if (i < (defaultValue || start)) {
            value += layoutWidths.current[i] || 0
          } else if (i === (defaultValue || start)) {
            value += (layoutWidths.current[i] || 0) / 2
            return true
          }
          return false
        })
        Animated.timing(panX.current, {
          toValue: -value + width.current,
          useNativeDriver: true,
          duration: 100,
        }).start()
        posX.current = -value + width.current
      }, 0)
    }
  }

  const panResponder = React.useRef(
    PanResponder.create({
      onPanResponderGrant: onSlidingStart,
      onPanResponderMove: onGestureEvent,
      onPanResponderRelease: onGestureEnd,
      onPanResponderTerminate: onGestureEnd,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
    }),
  )
  return (
    <View onLayout={onContainerLayout} renderToHardwareTextureAndroid style={style}>
      <View {...panResponder.current.panHandlers}>
        <Animated.View style={[styles.container, { transform: [{ translateX: panX.current }] }]}>
          {arr.map((item, index) => {
            // eslint-disable-next-line no-underscore-dangle
            let _style = {}
            if (!renderBar) {
              if (index % 10 === 0) _style = styles.largeBar
              else if (index % 5 === 0) _style = styles.mediumBar
            }
            return (
              <View key={item} onLayout={(e) => onBarLayout(e, item)}>
                {renderBar ? renderBar(item, index) : <View style={[styles.bar, _style]} />}
              </View>
            )
          })}
        </Animated.View>
        {renderPointer ? renderPointer() : <View style={styles.marker} />}
      </View>
      {/* </PanGestureHandler> */}
    </View>
  )
}

export default Ruler

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 50,
  },
  bar: {
    width: 1,
    height: 10,
    backgroundColor: 'black',
    marginHorizontal: 3,
  },
  mediumBar: {
    width: 1.5,
    height: 15,
    marginTop: -2.5,
  },
  largeBar: {
    width: 2,
    height: 20,
    marginTop: -5,
  },
  marker: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
    width: 2,
    height: 40,
    top: 0,
    marginTop: 35,
    backgroundColor: 'black',
  },
})
