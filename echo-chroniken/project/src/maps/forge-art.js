/* Echo-Chroniken: authentic forge map artwork for chapter 6.
   The data is a visual layer only; tile collisions and story continue in EchoMaps. */
(()=>{
 'use strict';
 const img=new Image();
 img.decoding='async';
 img.src='assets/maps/glut_forge_v1.png';
 window.EchoForgeArt=Object.freeze({image:img,
  ready:()=>img.complete && img.naturalWidth===720 && img.naturalHeight===480});
})();
