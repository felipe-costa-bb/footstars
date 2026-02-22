import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.config.errorHandler = (err, vm, info) => {
    console.error("Global Vue Error Handler:", err, info);
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.background = 'rgba(255, 0, 0, 0.9)';
    div.style.color = 'white';
    div.style.padding = '20px';
    div.style.zIndex = '999999';
    div.innerText = `Runtime Error: ${err.message}\nInfo: ${info}`;
    document.body.appendChild(div);
};

app.use(createPinia())
app.use(router)

app.mount('#app')
