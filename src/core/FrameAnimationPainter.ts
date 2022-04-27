import { Tween, Easing, Group } from '@tweenjs/tween.js'
import Two from 'two.js'
import { LyricLine } from './LyricParser'
import { getTicker, seekCurrentLine } from './utils'

const VIEW_WIDTH = 450
const VIEW_HEIGHT = 580
const FONT_SIZE = 28
const ROW_GUTTER = FONT_SIZE
const BACKGROUND_COLOR = 'rgba(8, 46, 84, 1)'
const BACKGROUND_COLOR_GRD = 'rgba(8, 46, 84, 0)'

const defaultStyle = {
  alignment: 'center',
  opacity: 0.3,
  scale: 1,
  baseline: 'top',
  fill: '#fff',
  stroke: '#CCCCCC',
  strokeWidth: 1,
  size: FONT_SIZE,
}

const activeStyle = {
  ...defaultStyle,
  opacity: 1,
  scale: 1.25,
}

type TextStyleType = typeof defaultStyle

export interface IConfig {
  defaultTextStyle?: Partial<TextStyleType>
  activeTextStyle?: Partial<TextStyleType>
  viewWidth?: number
  viewHeight?: number
  rowSpacing?: number
}

export class FrameAnimationPainter {
  ctx: CanvasRenderingContext2D

  lyrics: LyricLine[] = []

  stream: MediaStream

  currentLineNumber: number = 0

  animationGroup: Group

  title: string = ''

  artist: string = ''

  private two: Two

  private group: ReturnType<Two['makeGroup']>

  private viewWidth: number

  private viewHeight: number

  private rowSpacing: number

  private defaultTextStyle: TextStyleType

  private activeTextStyle: TextStyleType

  private audioElement?: HTMLAudioElement

  // eslint-disable-next-line class-methods-use-this
  private unbindListener = () => {}

  private ticker

  video: HTMLVideoElement

  constructor(config?: IConfig) {
    this.initConfig(config)
    this.initOffscreen()
    this.ticker = getTicker(this.two)
  }

  private initOffscreen() {
    const el = document.createElement('canvas')
    this.stream = el.captureStream()
    this.two = new Two({
      domElement: el,
      width: this.viewWidth,
      height: this.viewHeight,
    })
    this.animationGroup = new Group()
    const video = document.createElement('video')
    video.autoplay = true
    video.playsInline = true
    video.muted = true
    video.srcObject = this.stream
    // if not appended to DOM or set display none, requestPictureInPicture will show nothing
    video.style.height = '0px'
    video.style.width = '0px'
    video.style.visibility = 'hidden'
    this.video = video
    document.body.appendChild(this.video)
  }

  public on() {
    const el = this.audioElement
    if (!el) {
      return
    }
    this.off()
    const onTwoUpdate = () => {
      this.animationGroup.update()
    }
    this.two.bind('update', onTwoUpdate)
    const onTimeUpdate = this.handleTimeUpdate
    const onAudioPlay = () => {
      this.ticker.play()
    }
    const onAudioPause = () => {
      this.ticker.pause()
    }
    const onAudioEnded = () => {
      this.ticker.pause()
    }
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('play', onAudioPlay)
    el.addEventListener('pause', onAudioPause)
    el.addEventListener('ended', onAudioEnded)
    this.unbindListener = () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('play', onAudioPlay)
      el.removeEventListener('pause', onAudioPause)
      el.removeEventListener('ended', onAudioEnded)
      this.two.unbind(onTwoUpdate)
    }
  }

  public off() {
    this.unbindListener()
    this.unbindListener = () => {}
  }

  /**
   * update current playing audio and corresponding lyrics
   * @description call it when current audio is changed
   */
  public update(
    el: HTMLAudioElement,
    lyrics: LyricLine[],
    meta?: Record<'title' | 'artist', string>
  ) {
    this.lyrics = lyrics
    this.title = String(meta?.title) || ''
    this.artist = String(meta?.artist) || ''
    this.audioElement = el
    this.on()
    this.initLayout()
  }

  /**
   * update config
   * @description will repaint canvas using the incoming config
   */
  public updateConfig(config?: IConfig) {
    this.initConfig(config)
    this.on()
    this.initLayout()
  }

  private initConfig(config?: IConfig) {
    const {
      viewWidth = VIEW_WIDTH,
      viewHeight = VIEW_HEIGHT,
      defaultTextStyle = defaultStyle,
      activeTextStyle: activeTextStyleType = activeStyle,
      rowSpacing = ROW_GUTTER,
    } = config || {}
    this.viewWidth = Number(viewWidth)
    this.viewHeight = Number(viewHeight)
    this.rowSpacing = Number(rowSpacing)
    this.defaultTextStyle = { ...defaultStyle, ...defaultTextStyle }
    this.activeTextStyle = { ...activeStyle, ...activeTextStyleType }
  }

  private handleTimeUpdate = () => {
    const prevLN = this.currentLineNumber
    if (!this.audioElement) {
      return
    }
    const { currentTime } = this.audioElement
    const [, currentLineNumber] = seekCurrentLine(currentTime, this.lyrics)
    if (prevLN !== currentLineNumber) {
      this.currentLineNumber = currentLineNumber
      this.move(prevLN, currentLineNumber)
    }
  }

  private move(from: number, to: number) {
    this.animationGroup.getAll().forEach((it) => it.end())
    this.animationGroup.removeAll()
    // scroll into view
    const fromY = this.group.position.y
    const targetY = to * ROW_GUTTER + (to + 1) * FONT_SIZE
    const tOffset = new Tween(
      {
        y: fromY,
      },
      this.animationGroup
    )
      .to(
        {
          y: -targetY + VIEW_HEIGHT / 2,
        },
        // 应当小于和下一项的间隔？
        100
      )
      .easing(Easing.Quadratic.Out)
      .onUpdate((v) => {
        this.group.position.y = v.y
      })
    tOffset.start()
    // restore previous line text style
    const previous = this.group.children[from]
    new Tween(
      {
        scale: previous.scale,
        opacity: previous.opacity,
      },
      this.animationGroup
    )
      .to(
        {
          scale: defaultStyle.scale,
          opacity: defaultStyle.opacity,
        },
        100
      )
      .easing(Easing.Quadratic.Out)
      .onUpdate((v) => {
        Object.assign(previous, this.defaultTextStyle, v)
      })
      .start()
    // set current line text style
    const actived = this.group.children[to]
    new Tween(
      {
        scale: actived.scale,
        opacity: actived.opacity,
      },
      this.animationGroup
    )
      .to(
        {
          scale: activeStyle.scale,
          opacity: activeStyle.opacity,
        },
        100
      )
      .easing(Easing.Quadratic.In)
      .onUpdate((v) => {
        Object.assign(actived, this.activeTextStyle, v)
      })
      .start()
  }

  private createTitleArea() {
    const { title, artist, two, viewWidth, viewHeight } = this
    const group = new Two.Group()
    const gradient = two.makeLinearGradient(
      0,
      0,
      0,
      175,
      new Two.Stop(0, BACKGROUND_COLOR, 1),
      new Two.Stop(0.75, BACKGROUND_COLOR_GRD, 0)
    )
    gradient.units = 'userSpaceOnUse'
    const rect = new Two.Rectangle(viewWidth / 2, 25, viewWidth, 175)
    rect.noStroke()
    // @ts-ignore
    rect.fill = gradient
    group.add(rect)
    const titleText = new Two.Text(title, viewWidth / 2, 15, {
      size: 15,
      fill: '#fff',
    })
    const artistText = new Two.Text(artist, viewWidth / 2, 40, {
      size: 15,
      fill: '#fff',
    })
    const bottom = rect.clone()
    bottom.rotation = Math.PI
    bottom.position.set(viewWidth / 2, viewHeight)
    group.add(bottom)
    group.add(titleText)
    group.add(artistText)
    two.add(group)
  }

  private initLayout() {
    const { two, lyrics, viewWidth, viewHeight, rowSpacing, defaultTextStyle } = this
    two.clear()
    const rect = two.makeRectangle(viewWidth / 2, viewHeight / 2, viewWidth, VIEW_HEIGHT)
    rect.noStroke()
    rect.fill = BACKGROUND_COLOR
    // TODO: break lines
    const group = new Two.Group()
    this.lyrics = lyrics
    lyrics.forEach((line, index) => {
      const t = new Two.Text(
        line.text,
        viewWidth / 2,
        index * rowSpacing + (index + 1) * defaultTextStyle.size,
        defaultTextStyle
      )
      group.add(t)
    })
    this.group = group
    group.position.set(0, viewHeight / 2)
    two.add(group)
    this.createTitleArea()
    two.update()
  }
}
