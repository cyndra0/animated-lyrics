# Animated Lyrics

以“画中画”（Picture-In-Picture）的形式展示歌词动画。
Show lyrics animation In picture-in-picture view.

## Demo

[Demo](https://cyndra0.github.io/animated-lyrics/)

## 使用方式 Usage

```html
<!-- umd -->
<script src="index.min.js"></script>
<script>
  new AnimatedLyrics()
</script>
```

or:

```js
const anime = new AnimatedLyrics(config)
// 在开始播放/更换曲目时调用 update()
// call update() when start playing or changing current playing songs or lyrics
// 会在传入音频元素上重新绑定相应事件
// update() will attach/detach event listeners to video element automatically
anime.update(document.getElementById('video'), lyrics, {
  title,
  artist,
})
// 在更新动画设置时调用 updateConfig()，会用新的配置重新绘制动画
// call updateConfig() when you want to reset animation config, canvas will be rerendered
anime.updateConfig({
  activeTextStyle: {
    size: 32, // font-size
    stroke: '#000', // strokeColor
    opacity: 1,
    scale: 1,
    fill: '#fff',
    trokeWidth: 1,
  },
})
// 开启画中画
// request pictureInPicture
anime.requestPictureInPicture()
// 不再需要播放时调用，会取消事件绑定和移除隐藏的 video 元素
// call close() when you don't need to display the animation anymore (e.g. page unmounted), this call will detach event listeners and remove hidden video element
anime.close()
```

## 实现方式

1. 在播放时间更新时实时绘制歌词到 canvas 上。
2. 通过 `videoEl.srcObject = canvasEl.captureStream()` 将绘制结果输出到 video 尚
3. `videoEl.requestPictureInPicture()`

## 已知问题

- 尚未对一行显示不下的歌词需要换行的情况进行处理，不支持双语歌词。
- 因为用三方库实现 canvas 动画，所以包体积比较大
