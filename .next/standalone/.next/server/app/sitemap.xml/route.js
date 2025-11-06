(()=>{var e={};e.id=5475,e.ids=[5475],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},24971:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>d,routeModule:()=>p,serverHooks:()=>c,workAsyncStorage:()=>h,workUnitAsyncStorage:()=>u});var a={};t.r(a),t.d(a,{GET:()=>o});var i=t(96559),n=t(48088),l=t(37719),s=t(32190);async function o(){let e=process.env.NEXTAUTH_URL||"https://apexrebate.com",r=new Date().toISOString(),t=["vi","en"],a=[{path:"",priority:1,changeFreq:"daily"},{path:"/calculator",priority:.9,changeFreq:"weekly"},{path:"/wall-of-fame",priority:.8,changeFreq:"daily"},{path:"/faq",priority:.8,changeFreq:"weekly"},{path:"/how-it-works",priority:.7,changeFreq:"monthly"},{path:"/dashboard",priority:.7,changeFreq:"daily"},{path:"/auth/signin",priority:.5,changeFreq:"monthly"},{path:"/auth/signup",priority:.5,changeFreq:"monthly"},{path:"/apex-pro",priority:.6,changeFreq:"weekly"},{path:"/hang-soi",priority:.6,changeFreq:"daily"}].flatMap(a=>t.map(t=>({url:a.path?`${e}/${t}${a.path}`:`${e}/${t}`,lastModified:r,changeFrequency:a.changeFreq,priority:"vi"===t?a.priority:.9*a.priority})));a.unshift({url:e,lastModified:r,changeFrequency:"daily",priority:1});let i=`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
      ${a.map(e=>`
            <url>
              <loc>${e.url}</loc>
              <lastmod>${e.lastModified}</lastmod>
              <changefreq>${e.changeFrequency}</changefreq>
              <priority>${e.priority}</priority>
              ${e.url.includes("/vi")?`
                <xhtml:link rel="alternate" hreflang="en" href="${e.url.replace("/vi","/en")}" />
                <xhtml:link rel="alternate" hreflang="vi" href="${e.url}" />
                <xhtml:link rel="alternate" hreflang="x-default" href="${e.url}" />
              `:""}
              ${e.url.includes("/en")?`
                <xhtml:link rel="alternate" hreflang="vi" href="${e.url.replace("/en","/vi")}" />
                <xhtml:link rel="alternate" hreflang="en" href="${e.url}" />
                <xhtml:link rel="alternate" hreflang="x-default" href="${e.url.replace("/en","/vi")}" />
              `:""}
            </url>
          `).join("")}
    </urlset>`;return new s.NextResponse(i,{status:200,headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=3600, s-maxage=3600"}})}let p=new i.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/sitemap.xml/route",pathname:"/sitemap.xml",filename:"route",bundlePath:"app/sitemap.xml/route"},resolvedPagePath:"/Users/macbookprom1/apexrebate-1/src/app/sitemap.xml/route.ts",nextConfigOutput:"standalone",userland:a}),{workAsyncStorage:h,workUnitAsyncStorage:u,serverHooks:c}=p;function d(){return(0,l.patchFetch)({workAsyncStorage:h,workUnitAsyncStorage:u})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var r=require("../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[7719,580],()=>t(24971));module.exports=a})();