import Two from 'two.js'
import type { LyricLine } from './LyricParser'

export function getTimestamp(str: string): number {
  const matchResult = str.match(/(\d{2}):(\d{2})\.(\d{2})/)
  if (matchResult) {
    const [, m, s, hs] = matchResult
    return Number(hs) * 0.01 + Number(s) + Number(m) * 60
  }
  return 0
}

/**
 * seekCurrentLine
 * @description 根据当前时间，获取当前歌词行及行数
 * @param currentTime 当前时间
 * @param lines 歌词列表
 * @returns [歌词行, 歌词行号]
 */
export function seekCurrentLine<T extends LyricLine>(currentTime: number, lines: T[]): [T, number] {
  const findIndex = () => {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i]
      if (currentTime < line.time) {
        return Math.max(0, i - 1)
      }
      if (currentTime === line.time) {
        return i
      }
    }
    return lines.length - 1
  }
  const currentLineNumber = findIndex()
  return [lines[currentLineNumber], currentLineNumber]
}

// we can't simply use rAF because the page might be running in background
let lastTime = 0
function rAF(callback) {
  const now = Date.now()
  const interval = Math.max(0, 16.6 - (now - lastTime))
  const nextCallTime = now + interval
  lastTime = nextCallTime
  const id = setTimeout(() => {
    callback(nextCallTime)
  }, interval)
  return id
}

export const getTicker = (two: Two) => {
  let nextId
  const loop = () => {
    nextId = rAF(() => {
      two.update()
      loop()
    })
  }
  const pause = () => {
    clearTimeout(nextId)
  }
  return {
    play: loop,
    pause,
  }
}
