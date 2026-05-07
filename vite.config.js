import { defineConfig } from 'vite';
import obfuscator from 'rollup-plugin-javascript-obfuscator';

console.log('Vite config is loading...'); // 測試用
// export default defineConfig({
//   build: {
//     // 這裡很重要：把內建壓縮關掉，讓混淆插件接管，避免它把混淆後的程式碼又「優化」回去
//     minify: 'terser', 
//     rollupOptions: {
//       plugins: [
//         obfuscator({
//           compact: true,
//           controlFlowFlattening: true, // 強制改變邏輯流
//           controlFlowFlatteningThreshold: 1,
//           numbersToExpressions: true,
//           simplify: true,
//           stringArray: true,
//           stringArrayEncoding: ['base64'],
//           stringArrayThreshold: 1,
//           // 加上這行，強制處理所有匯入的模組
//           transformObjectKeys: true, 
//           unicodeEscapeSequence: true
//         })
//       ]
//     }
//   }
// });