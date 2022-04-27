import serve from 'rollup-plugin-serve-range'
import { createConfig } from './rollup.prod.config'

export default createConfig(
  {
    watch: {
      include: 'src/**',
    },
    output: {
      file: 'dist/index.dev.js',
    },
  },
  [
    serve({
      contentBase: '.',
      open: true,
      openPage: '/demo/index.html',
    }),
  ]
)
