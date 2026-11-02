/* Echo-Chroniken M01-04: Encounter definitions.
 * This first release registers ONLY the existing Wurzelheim map.
 * Future regions will receive explicit 100%-weighted tables after maps exist.
 */
window.ECHO_ENCOUNTER_TABLES = Object.freeze([
  Object.freeze({mapId:'legacy_wurzeldorf',mode:'legacy-progressive'}),
  Object.freeze({mapId:'lake_north_path',mode:'weighted',entries:[
    {id:65,weight:36,minLevel:3,maxLevel:12},
    {id:95,weight:29,minLevel:3,maxLevel:12},
    {id:109,weight:21,minLevel:3,maxLevel:12},
    {id:112,weight:14,minLevel:3,maxLevel:12}
  ]}),
  Object.freeze({mapId:'nebelhafen_town',mode:'weighted',entries:[
    {id:65,weight:30,minLevel:3,maxLevel:12},
    {id:95,weight:30,minLevel:3,maxLevel:12},
    {id:109,weight:25,minLevel:3,maxLevel:12},
    {id:112,weight:15,minLevel:3,maxLevel:12}
  ]}),
  Object.freeze({mapId:'moorglas_bog',mode:'weighted',entries:[
    {id:29,weight:30,minLevel:7,maxLevel:17},
    {id:40,weight:24,minLevel:7,maxLevel:17},
    {id:67,weight:18,minLevel:7,maxLevel:17},
    {id:79,weight:12,minLevel:7,maxLevel:17},
    {id:84,weight:8,minLevel:7,maxLevel:17},
    {id:101,weight:5,minLevel:7,maxLevel:17},
    {id:106,weight:3,minLevel:7,maxLevel:17}
  ]}),
  ...['ashrail_approach','glut_chasm'].map(mapId=>Object.freeze({
    mapId,mode:'weighted',entries:[
      {id:18,weight:33,minLevel:8,maxLevel:26},
      {id:23,weight:26,minLevel:8,maxLevel:26},
      {id:51,weight:20,minLevel:8,maxLevel:26},
      {id:121,weight:13,minLevel:8,maxLevel:26},
      {id:124,weight:8,minLevel:8,maxLevel:26}
    ]})),
  ...['garden_road','lichterhain_grove','echo_garden'].map(mapId=>Object.freeze({
    mapId,mode:'weighted',entries:[
      {id:57,weight:20,minLevel:8,maxLevel:30},
      {id:27,weight:35,minLevel:8,maxLevel:30},
      {id:77,weight:25,minLevel:8,maxLevel:30},
      {id:60,weight:20,minLevel:8,maxLevel:30}
    ]})),
  Object.freeze({mapId:'capital_outer_gate',mode:'weighted',entries:[
    {id:45,weight:50,minLevel:8,maxLevel:35},
    {id:87,weight:25,minLevel:8,maxLevel:35},
    {id:71,weight:25,minLevel:8,maxLevel:35}
  ]})
]);