if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return i[e]||(r=new Promise(async r=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=r}else importScripts(e),r()})),r.then(()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]})},r=(r,i)=>{Promise.all(r.map(e)).then(e=>i(1===e.length?e[0]:e))},i={require:Promise.resolve(r)};self.define=(r,a,c)=>{i[r]||(i[r]=Promise.resolve().then(()=>{let i={};const s={uri:location.origin+r.slice(1)};return Promise.all(a.map(r=>{switch(r){case"exports":return i;case"module":return s;default:return e(r)}})).then(e=>{const r=c(...e);return i.default||(i.default=r),i})}))}}define("./service-worker.js",["./workbox-d9851aed"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/./index.html",revision:"54e3a97e2388ad1c265da0a53baee0f9"},{url:"/./player.html",revision:"5bee07c368fe0975a83cad337f974a06"},{url:"/3a8ca398e6a5c3b83f4de7c60843a9a0.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"},{url:"/editor.css?9d0ec2960684c544549d",revision:"14b95d110d85b4dfbdb6bed8ca36699e"},{url:"/editor.js?be5e51ba9e81c067a770",revision:"1913d5fede5aa78b2a825f722051ef3a"},{url:"/icon.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"},{url:"/player.css?9d0ec2960684c544549d",revision:"14b95d110d85b4dfbdb6bed8ca36699e"},{url:"/player.js?71db836f5e653fbcc6a7",revision:"5348b7e36a045cd39a583b3f7028b10a"}],{})}));
