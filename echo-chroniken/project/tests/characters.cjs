const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function canvas(){
 const pixels=Array.from({length:20},()=>Array(16).fill(''));
 const ctx={fillStyle:'',imageSmoothingEnabled:false,
  fillRect(x,y,w,h){
   for(let j=Math.floor(y);j<y+h;j++)for(let i=Math.floor(x);i<x+w;i++){
    if(i>=0&&i<16&&j>=0&&j<20)pixels[j][i]=this.fillStyle;
   }
  }};
 return {width:0,height:0,pixels,getContext:()=>ctx};
}
const document={createElement:t=>{assert.equal(t,'canvas');return canvas()}};
const window={};
vm.runInNewContext(fs.readFileSync('src/characters.js','utf8'),{window,document,console});
const api=window.EchoCharacters;
assert.equal(api.WIDTH,16);assert.equal(api.HEIGHT,20);
assert(api.ROLES.length>=15);
assert.deepEqual(Array.from(api.DIRECTIONS),['down','up','left','right']);
const key=c=>JSON.stringify(c.pixels);
for(const role of api.ROLES){
 const unique=new Set(),art=[];
 for(const dir of api.DIRECTIONS){
  for(let step=0;step<3;step++){
   const sprite=api.frame(role,dir,step);
   assert.equal(sprite.width,16);assert.equal(sprite.height,20);
   const filled=sprite.pixels.flat().filter(Boolean).length;
   assert(filled>35&&filled<265,role+' fill count '+filled);
   unique.add(key(sprite));art.push(sprite);
  }
 }
 assert.equal(unique.size,12,role+' must show distinct frames in all four directions');
 assert.strictEqual(api.frame(role,'down',0),art[0],'Cache should return same frame');
}
assert.notEqual(key(api.frame('player','down',0)),key(api.frame('oma','down',0)));
assert.notEqual(key(api.frame('girl','down',0)),key(api.frame('boy','down',0)));
assert.notEqual(key(api.frame('citizen','down',0,'#aabbcc')),
 key(api.frame('citizen','down',0,'#cceedd')),'NPC tint should distinguish roles');
assert.equal(key(api.frame('witness1','down',0)),key(api.frame('nemi','down',0)));
assert.equal(key(api.frame('not_a_role','down',0)),key(api.frame('citizen','down',0)));
const calls=[];
const ctx={imageSmoothingEnabled:true,save(){calls.push('save')},restore(){calls.push('restore')},
 drawImage(sprite,x,y){calls.push([sprite,x,y]);}};
api.draw(ctx,40,56,'oma','left',2);
assert.equal(calls[1][1],40);assert.equal(calls[1][2],52);
assert.equal(calls[0],'save');assert.equal(calls[2],'restore');
console.log('PASS: 16 character identities, 4 directions x 3 distinct poses, cached pixels, tints, role aliases, exact drawing position');
