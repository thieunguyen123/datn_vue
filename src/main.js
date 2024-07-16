import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router';
import { install } from "vue3-recaptcha-v2";
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';
import {
  faFilePen, faHeart, faMagnifyingGlass, faRightToBracket, faArrowLeftLong,
  faLocationDot, faChevronDown, faEllipsisVertical, faList
} from '@fortawesome/free-solid-svg-icons';
library.add(faFacebook, faGoogle, faMagnifyingGlass, faRightToBracket, faHeart, faFilePen,
  faArrowLeftLong, faLocationDot, faChevronDown, faEllipsisVertical, faList);
const recaptchaSiteKey = process.env.VUE_APP_RECAPTCHA_SITE_KEY;
import goongjs from '@goongmaps/goong-js';
import firestore from '../firebase';
goongjs.accessToken = process.env.VUE_APP_GOONG_MAP_KEY;
const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(ElementPlus);
app.use(pinia);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(firestore);
app.use(install, {
  sitekey: recaptchaSiteKey,
  cnDomains: false,
});
app.mount('#app');
