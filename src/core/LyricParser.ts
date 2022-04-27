import { getTimestamp } from './utils'

const OFFSET_ID_TAG = 'offset' // [offset:1000] (ms)

export interface LyricLine {
  /**
   * 距离起始位置的时间(ms)
   * */
  time: number
  text: string
}

class LyricParser {
  input: string

  lines: LyricLine[] = []

  constructor(lyric: string) {
    this.input = lyric
    this.parse()
  }

  private parse() {
    let offset = 0
    this.input.split(/\r?\n/).forEach((raw) => {
      const matchResult = raw.match(/\[(.*)\](.*)/)
      if (matchResult !== null) {
        const [, tag, txt] = matchResult
        let time = 0
        let text = ''
        if (/\d{2}:\d{2}.\d{2}/.test(tag)) {
          time = getTimestamp(tag)
          text = txt
        } else {
          const [tagProp, tagValue] = tag.split(/:\s*/)
          const extraTxt = OFFSET_ID_TAG[tagProp]
          if (extraTxt === 'offset') {
            offset = Number(offset) || 0
            return
          }
          text = `${tagProp}: ${tagValue}`
        }
        this.lines.push({
          time,
          text,
        })
      }
      if (offset !== 0) {
        this.lines.forEach((line) => {
          // eslint-disable-next-line no-param-reassign
          line.time += offset
        })
      }
    })
  }
}

export { LyricParser }
