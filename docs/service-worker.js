if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return i[e]||(r=new Promise(async r=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=r}else importScripts(e),r()})),r.then(()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]})},r=(r,i)=>{Promise.all(r.map(e)).then(e=>i(1===e.length?e[0]:e))},i={require:Promise.resolve(r)};self.define=(r,c,s)=>{i[r]||(i[r]=Promise.resolve().then(()=>{let i={};const o={uri:location.origin+r.slice(1)};return Promise.all(c.map(r=>{switch(r){case"exports":return i;case"module":return o;default:return e(r)}})).then(e=>{const r=s(...e);return i.default||(i.default=r),i})}))}}define("./service-worker.js",["./workbox-d9851aed"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/./index.html",revision:"ef2958c69fc11b6a14108bd354fe342a"},{url:"/3a8ca398e6a5c3b83f4de7c60843a9a0.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"},{url:"/editor.css?40b30dd630cff68e20bd",revision:"204d1acffa2effaa4aee4874200cadd7"},{url:"/editor.js?eddc9be58c6e962890d2",revision:"5a0b17c279b808edf175adee75a36ba6"},{url:"/icon.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"}],{})}));
