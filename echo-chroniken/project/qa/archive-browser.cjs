// Local Chrome only. Run with Playwright installed or provided through NODE_PATH.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.resolve(root,'../docs/visual-audit/archive-qa');
const fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/saves/07-new-schema-v2.json')));
fixture.scene='OVERWORLD';fixture.introStage=4;fixture.hasStarter=true;
fixture.team=Array.from({length:6},(_,i)=>({...fixture.team[0],id:i+1,uid:'qa-'+i,moves:['seelenstups']}));
fixture.archive=Array.from({length:144},(_,i)=>({...fixture.team[0],id:i+7,uid:'archive-'+i,moves:['seelenstups']}));
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const errors=[];
 try{
  for(const mobile of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(data=>{if(!sessionStorage.getItem('qa-seeded')){localStorage.setItem('echo_chroniken_tv_save',JSON.stringify(data));sessionStorage.setItem('qa-seeded','1');}},fixture);
   await page.goto(base+(mobile?'/?touch':''));
   await page.waitForFunction(()=>typeof window.echoQASnapshot==='function');
   const snap=()=>page.evaluate(()=>window.echoQASnapshot());
   const cmd=async name=>{if(mobile)await page.locator('[data-cmd="'+name+'"]').tap();else await page.keyboard.press(({A:'Enter',B:'x',START:'m',UP:'ArrowUp',DOWN:'ArrowDown',LEFT:'ArrowLeft',RIGHT:'ArrowRight'})[name]);};
   const open=async()=>{await cmd('START');for(let i=0;i<3;i++)await cmd('DOWN');await cmd('A');assert.equal((await snap()).mode,'ARCHIVE');};
   await cmd('A');await open();
   await page.screenshot({path:path.join(out,mobile?'mobile-full.png':'desktop-full.png')});
   if(mobile){
    const box=await page.locator('#screen').boundingBox();
    const tap=(x,y)=>page.touchscreen.tap(box.x+x/320*box.width,box.y+y/180*box.height);
    await tap(30,100);await tap(30,100);
    assert.equal((await snap()).team[0].id,8);
   }else{
    await cmd('UP');await page.screenshot({path:path.join(out,'desktop-last-page.png')});
    await cmd('A');assert.equal((await snap()).team[0].id,150);
   }
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('echo_chroniken_tv_save')));
   assert.equal(saved.archive.length,144);assert.equal(saved.archive[mobile?1:143].id,1);
   await page.reload();await page.waitForFunction(()=>typeof window.echoQASnapshot==='function');
   assert.equal((await snap()).team[0].id,mobile?8:150);
   assert.equal((await snap()).archiveCount,144);
   await cmd('A');await open();
   await page.screenshot({path:path.join(out,mobile?'mobile-reloaded.png':'desktop-reloaded.png')});
   await cmd('B');assert.equal((await snap()).mode,'MENU');await cmd('B');assert.equal((await snap()).mode,'OVERWORLD');
   // Legacy save without archive must render an empty archive after migration.
   await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('echo_chroniken_tv_save'));delete s.archive;localStorage.setItem('echo_chroniken_tv_save',JSON.stringify(s));});
   await page.reload();await page.waitForFunction(()=>typeof window.echoQASnapshot==='function');
   await cmd('A');await open();assert.equal((await snap()).archiveCount,0);
   await cmd('A');assert.equal((await snap()).team.length,6);
   await page.screenshot({path:path.join(out,mobile?'mobile-empty.png':'desktop-empty.png')});
   await context.close();
  }
  assert.deepEqual(errors,[],'No browser JS exceptions');
  const report={browser:await browser.version(),local:true,checks:['desktop keyboard archive/wrap/swap','mobile touch selection/swap','autosave/reload','legacy empty archive'],errors};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
