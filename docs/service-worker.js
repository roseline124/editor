if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return c[e]||(r=new Promise(async r=>{if("document"in self){const c=document.createElement("script");c.src=e,document.head.appendChild(c),c.onload=r}else importScripts(e),r()})),r.then(()=>{if(!c[e])throw new Error(`Module ${e} didn’t register its module`);return c[e]})},r=(r,c)=>{Promise.all(r.map(e)).then(e=>c(1===e.length?e[0]:e))},c={require:Promise.resolve(r)};self.define=(r,a,i)=>{c[r]||(c[r]=Promise.resolve().then(()=>{let c={};const s={uri:location.origin+r.slice(1)};return Promise.all(a.map(r=>{switch(r){case"exports":return c;case"module":return s;default:return e(r)}})).then(e=>{const r=i(...e);return c.default||(c.default=r),c})}))}}define("./service-worker.js",["./workbox-d9851aed"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/./index.html",revision:"c51b186febe9cba505457b57e9c34189"},{url:"/./player.html",revision:"db0d6e35d2ed3738f594949205b2eff1"},{url:"/3a8ca398e6a5c3b83f4de7c60843a9a0.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"},{url:"/editor.css?7ef2856dcac0e10d074b",revision:"0dc88b95bc122ffaae4aa9f3bc21c73e"},{url:"/editor.js?2c1f121ac62600ae49bc",revision:"3992a361f2a9358114a8fb848492fa7c"},{url:"/icon.png",revision:"3a8ca398e6a5c3b83f4de7c60843a9a0"},{url:"/player.css?7ef2856dcac0e10d074b",revision:"0dc88b95bc122ffaae4aa9f3bc21c73e"},{url:"/player.js?8046dae24669c0f70ac8",revision:"a8927b703411437a7fdc3a784d405237"}],{})}));
