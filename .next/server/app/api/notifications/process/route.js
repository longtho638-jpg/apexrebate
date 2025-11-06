(()=>{var e={};e.id=3964,e.ids=[3964,5069],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},5069:(e,t,n)=>{"use strict";n.d(t,{db:()=>r,prisma:()=>i});var a=n(96330);let r=globalThis.prisma??new a.PrismaClient({log:["query"]}),i=r},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21111:(e,t,n)=>{"use strict";n.d(t,{Z$:()=>r,ZM:()=>o,gm:()=>s});var a=n(5069),r=function(e){return e.WELCOME="welcome",e.PAYOUT_RECEIVED="payout_received",e.ACHIEVEMENT_UNLOCKED="achievement_unlocked",e.TIER_UPGRADE="tier_upgrade",e.REFERRAL_SUCCESS="referral_success",e.WEEKLY_DIGEST="weekly_digest",e.MONTHLY_REPORT="monthly_report",e.INACTIVITY_WARNING="inactivity_warning",e.MILESTONE_REACHED="milestone_reached",e.CONCIERGE_UPDATE="concierge_update",e}({});class i{constructor(){this.zai=null}static getInstance(){return i.instance||(i.instance=new i),i.instance}async initializeZAI(){try{let e=await n.e(7838).then(n.bind(n,87838));this.zai=await e.create(),console.log("Email service initialized with ZAI SDK")}catch(e){console.error("Failed to initialize ZAI SDK for email service:",e)}}async generateEmailContent(e,t){this.zai||await this.initializeZAI();let n={welcome:{subject:"Ch\xe0o mừng đến với ApexRebate - Dịch vụ Ho\xe0n ph\xed Concierge",context:"Generate a welcome email for a new trader who just joined ApexRebate"},payout_received:{subject:"ApexRebate: Bạn đ\xe3 nhận được ho\xe0n ph\xed mới!",context:"Generate an email notification for a trader who received a new payout"},achievement_unlocked:{subject:"\uD83C\uDF89 Ch\xfac mừng! Bạn đ\xe3 mở kh\xf3a th\xe0nh tựu mới",context:"Generate an email to congratulate a trader on unlocking a new achievement"},tier_upgrade:{subject:"\uD83C\uDFC6 N\xe2ng cấp th\xe0nh c\xf4ng! Hạng mới của bạn tại ApexRebate",context:"Generate an email to congratulate a trader on upgrading to a new tier"},referral_success:{subject:"Tuyệt vời! Lời giới thiệu của bạn đ\xe3 tham gia ApexRebate",context:"Generate an email to notify a trader that their referral was successful"},weekly_digest:{subject:"ApexRebate Weekly Digest - Tổng quan hiệu suất của bạn",context:"Generate a weekly digest email with trading performance summary"},monthly_report:{subject:"ApexRebate Monthly Report - B\xe1o c\xe1o chi tiết th\xe1ng {month}",context:"Generate a comprehensive monthly report email"},inactivity_warning:{subject:"Bạn c\xf3 ổn kh\xf4ng? Ch\xfang t\xf4i nhớ bạn tại ApexRebate",context:"Generate a gentle re-engagement email for inactive traders"},milestone_reached:{subject:"\uD83C\uDFAF Cột mốc ấn tượng! Th\xe0nh tựu của bạn tại ApexRebate",context:"Generate an email to celebrate reaching a significant milestone"},concierge_update:{subject:"Cập nhật từ Concierge ApexRebate",context:"Generate a personalized update from the concierge service"}}[e];if(!n)throw Error(`Email type ${e} not supported`);try{let e=await this.zai.chat.completions.create({messages:[{role:"system",content:`You are a professional email writer for ApexRebate, a premium trading rebate service. 
            Write emails in Vietnamese that are:
            - Professional yet friendly
            - Data-driven and personalized
            - Motivational and encouraging
            - Clear and concise
            - Include specific numbers and metrics when provided
            
            The email should be well-structured with:
            1. Compelling subject line
            2. Personalized greeting
            3. Main content with specific data
            4. Call to action
            5. Professional closing`},{role:"user",content:`${n.context}
            
            User data: ${JSON.stringify(t,null,2)}
            
            Generate a complete email with subject and HTML content. The email should be engaging and personalized.`}],temperature:.7,max_tokens:1e3}),a=e.choices[0]?.message?.content||"";a.split("\n");let r=n.subject,i=a,s=a.match(/Subject[:\s]*(.+?)(?:\n|$)/i);s&&(r=s[1].trim(),i=a.replace(/Subject[:\s]*(.+?)(?:\n|$)/i,"").trim());let o=this.convertToHTML(i,t);return{subject:r,html:o,text:i.replace(/<[^>]*>/g,"")}}catch(n){return console.error("Failed to generate email content:",n),this.getFallbackTemplate(e,t)}}convertToHTML(e,t){let n=e.replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>");return`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ApexRebate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .metric { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
          .highlight { color: #007bff; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 ApexRebate</h1>
            <p>Dịch vụ Ho\xe0n ph\xed Concierge cho Trader chuy\xean nghiệp</p>
          </div>
          <div class="content">
            <p>${n}</p>
            ${this.generatePersonalizedContent(t)}
          </div>
          <div class="footer">
            <p>\xa9 2024 ApexRebate. All rights reserved.</p>
            <p>Đ\xe2y l\xe0 email tự động. Vui l\xf2ng kh\xf4ng trả lời email n\xe0y.</p>
          </div>
        </div>
      </body>
      </html>
    `}generatePersonalizedContent(e){let t="";return e.userName&&(t+=`<div class="metric"><strong>Ch\xe0o ${e.userName},</strong></div>`),e.payoutAmount&&(t+=`<div class="metric">
        <strong>Ho\xe0n ph\xed nhận được:</strong> <span class="highlight">$${e.payoutAmount.toLocaleString()}</span>
      </div>`),e.totalSaved&&(t+=`<div class="metric">
        <strong>Tổng đ\xe3 tiết kiệm:</strong> <span class="highlight">$${e.totalSaved.toLocaleString()}</span>
      </div>`),e.currentTier&&(t+=`<div class="metric">
        <strong>Hạng hiện tại:</strong> <span class="highlight">${e.currentTier}</span>
      </div>`),e.achievementTitle&&(t+=`<div class="metric">
        <strong>Th\xe0nh tựh mới:</strong> <span class="highlight">${e.achievementTitle}</span>
      </div>`),e.referralName&&(t+=`<div class="metric">
        <strong>Lời giới thiệu th\xe0nh c\xf4ng:</strong> <span class="highlight">${e.referralName}</span>
      </div>`),t+=`
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">
          Xem Dashboard
        </a>
      </div>
    `}getFallbackTemplate(e,t){let n={welcome:{subject:"Ch\xe0o mừng đến với ApexRebate!",html:`<p>Ch\xe0o mừng ${t.userName||"bạn"} đ\xe3 tham gia ApexRebate!</p>
               <p>Ch\xfang t\xf4i rất vui được đồng h\xe0nh c\xf9ng bạn tr\xean h\xe0nh tr\xecnh tối ưu h\xf3a lợi nhuận giao dịch.</p>`},payout_received:{subject:"Bạn đ\xe3 nhận được ho\xe0n ph\xed mới!",html:`<p>Ch\xfac mừng! Bạn vừa nhận được ho\xe0n ph\xed <strong>$${t.payoutAmount||0}</strong>.</p>`},achievement_unlocked:{subject:"Ch\xfac mừng th\xe0nh tựu mới!",html:`<p>Tuyệt vời! Bạn đ\xe3 mở kh\xf3a th\xe0nh tựh <strong>${t.achievementTitle||"mới"}</strong>.</p>`}}[e]||{subject:"Th\xf4ng b\xe1o từ ApexRebate",html:"<p>Bạn c\xf3 một th\xf4ng b\xe1o mới từ ApexRebate.</p>"};return{subject:n.subject,html:this.convertToHTML(n.html,t)}}async createNotification(e,t,n,r,i){let s={id:`email_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,userId:e,type:t,recipient:n,subject:"",content:"",data:r,status:"pending",createdAt:new Date,scheduledFor:i};try{await a.db.emailNotification.create({data:{id:s.id,userId:e,type:t,recipient:n,subject:s.subject,content:s.content,data:r?JSON.stringify(r):null,status:s.status,scheduledFor:i}})}catch(e){console.error("Failed to save email notification to database:",e)}return s}async sendEmail(e){try{let t=await this.generateEmailContent(e.type,e.data||{});return e.subject=t.subject,e.content=t.html,console.log("\uD83D\uDCE7 Sending email:",{to:e.recipient,subject:e.subject,type:e.type}),await new Promise(e=>setTimeout(e,1e3)),e.status="sent",e.sentAt=new Date,await a.db.emailNotification.update({where:{id:e.id},data:{subject:e.subject,content:e.content,status:"sent",sentAt:e.sentAt}}),console.log("✅ Email sent successfully"),!0}catch(t){return console.error("Failed to send email:",t),e.status="failed",e.error=t instanceof Error?t.message:"Unknown error",await a.db.emailNotification.update({where:{id:e.id},data:{status:"failed",error:e.error}}),!1}}async scheduleEmail(e,t,n,a,r){return this.createNotification(e,t,n,r,a)}async sendImmediateEmail(e,t,n,a){let r=await this.createNotification(e,t,n,a);return this.sendEmail(r)}async processPendingEmails(){try{let e=await a.db.emailNotification.findMany({where:{status:"pending",OR:[{scheduledFor:null},{scheduledFor:{lte:new Date}}]},orderBy:{createdAt:"asc"},take:50});for(let t of(console.log(`📧 Processing ${e.length} pending emails`),e)){let e={id:t.id,userId:t.userId,type:t.type,recipient:t.recipient,subject:t.subject,content:t.content,data:t.data?JSON.parse(t.data):void 0,status:t.status,createdAt:t.createdAt,sentAt:t.sentAt||void 0,error:t.error||void 0,scheduledFor:t.scheduledFor||void 0};await this.sendEmail(e)}}catch(e){console.error("Failed to process pending emails:",e)}}async getUserEmailPreferences(e){try{let t=await a.db.users.findUnique({where:{id:e},select:{email:!0,emailVerified:!0}});return{enabled:!!t?.emailVerified,email:t?.email}}catch(e){return console.error("Failed to get user email preferences:",e),{enabled:!1,email:null}}}async unsubscribeUser(e,t){console.log(`User ${e} unsubscribed from ${t||"all"} emails`)}}let s=i.getInstance();async function o(e,t,n,a){try{return console.log("\uD83D\uDCE7 Sending email:",{to:e,subject:t}),await new Promise(e=>setTimeout(e,1e3)),console.log("✅ Email sent successfully"),!0}catch(e){return console.error("Failed to send email:",e),!1}}},21820:e=>{"use strict";e.exports=require("os")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},79748:e=>{"use strict";e.exports=require("fs/promises")},81224:(e,t,n)=>{"use strict";n.r(t),n.d(t,{patchFetch:()=>m,routeModule:()=>d,serverHooks:()=>h,workAsyncStorage:()=>u,workUnitAsyncStorage:()=>p});var a={};n.r(a),n.d(a,{POST:()=>l});var r=n(96559),i=n(48088),s=n(37719),o=n(32190),c=n(21111);async function l(e){try{let t=e.headers.get("authorization"),n=process.env.CRON_SECRET;if(n&&t!==`Bearer ${n}`)return o.NextResponse.json({success:!1,error:{code:"UNAUTHORIZED",message:"Unauthorized"}},{status:401});return await c.gm.processPendingEmails(),o.NextResponse.json({success:!0,message:"Processed pending emails successfully"})}catch(e){return console.error("Process emails API error:",e),o.NextResponse.json({success:!1,error:{code:"INTERNAL_ERROR",message:"Lỗi server nội bộ"}},{status:500})}}let d=new r.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/notifications/process/route",pathname:"/api/notifications/process",filename:"route",bundlePath:"app/api/notifications/process/route"},resolvedPagePath:"/Users/macbookprom1/apexrebate-1/src/app/api/notifications/process/route.ts",nextConfigOutput:"standalone",userland:a}),{workAsyncStorage:u,workUnitAsyncStorage:p,serverHooks:h}=d;function m(){return(0,s.patchFetch)({workAsyncStorage:u,workUnitAsyncStorage:p})}},96330:e=>{"use strict";e.exports=require("@prisma/client")},96487:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),a=t.X(0,[7719,580],()=>n(81224));module.exports=a})();