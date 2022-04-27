import { getTimestamp, seekCurrentLine } from '@/core/utils'

describe('utils', () => {
  test('utils.getTimeStamp() should return seconds in number correctly', () => {
    expect(getTimestamp('00:12.34')).toBe(12.34)
    expect(getTimestamp('00:00.00')).toBe(0)
    expect(getTimestamp('03:00.00')).toBe(180)
  })
  test('utils.seekCurrentLine() should return correctly in terms of [line, lineNumber]', () => {
    const lines = [
      { time: 0, text: 'hello' },
      { time: 10, text: 'world' },
      { time: 20, text: '!' },
    ]
    expect(seekCurrentLine(0, lines)).toEqual([lines[0], 0])
    expect(seekCurrentLine(5, lines)).toEqual([lines[0], 0])
    expect(seekCurrentLine(10, lines)).toEqual([lines[1], 1])
    expect(seekCurrentLine(15, lines)).toEqual([lines[1], 1])
    expect(seekCurrentLine(20, lines)).toEqual([lines[2], 2])
    expect(seekCurrentLine(25, lines)).toEqual([lines[2], 2])
  })
})
