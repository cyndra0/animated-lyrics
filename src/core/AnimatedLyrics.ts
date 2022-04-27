/* eslint-disable no-underscore-dangle */
import { FrameAnimationPainter, IConfig } from './FrameAnimationPainter'
import { LyricParser } from './LyricParser'

function warnAlreadyClosed() {
  // eslint-disable-next-line no-console
  console.warn(
    'AnimatedLyrics is closed, please call `new AnimatedLyrics()` to create a new instance'
  )
}

export class AnimatedLyrics {
  framePainter: FrameAnimationPainter | null

  private _closed = false

  get isClosed() {
    return this._closed
  }

  constructor(config?: IConfig) {
    this.framePainter = new FrameAnimationPainter(config)
  }

  requestPictureInPicture() {
    if (this._closed) {
      warnAlreadyClosed()
    }
    const { video } = this.framePainter!
    try {
      video.requestPictureInPicture()
    } catch (E) {
      const retry = () => {
        this.requestPictureInPicture()
        video.removeEventListener('loadedmetadata', retry)
      }
      video.addEventListener('loadedmetadata', retry)
    }
  }

  update(el: HTMLAudioElement, lyrics: string, meta?: Record<'title' | 'artist', string>) {
    if (this._closed) {
      warnAlreadyClosed()
    }
    const { lines } = new LyricParser(lyrics)
    this.framePainter!.update(el, lines, meta)
  }

  updateConfig: FrameAnimationPainter['updateConfig'] = (config) => {
    if (this._closed) {
      warnAlreadyClosed()
    }
    this.framePainter!.updateConfig(config)
  }

  close() {
    if (this._closed) {
      warnAlreadyClosed()
    }
    this.framePainter!.off()
    this.framePainter!.video.remove()
    this.framePainter = null
    this._closed = true
  }
}
