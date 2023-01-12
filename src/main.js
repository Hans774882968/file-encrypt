import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import hljs from 'highlight.js';
import App from './App.vue';
import router from './router';
import 'element-plus/dist/index.css';
import 'video.js/dist/video-js.css';
import 'highlight.js/styles/atom-one-dark.css';

const app = createApp(App);

app.use(router).use(ElementPlus).mount('#app');

app.config.globalProperties.$hljs = hljs;
