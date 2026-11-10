(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,[8937,44628,e=>{var t=e.i(90072),a=e.i(8560);let r=new t.nd;class i{constructor(e){e=e||{},this.zNear=!0===e.webGL?-1:0,this.zFar=1,this.vertices={near:[new t.cE,new t.cE,new t.cE,new t.cE],far:[new t.cE,new t.cE,new t.cE,new t.cE]},void 0!==e.projectionMatrix&&this.setFromProjectionMatrix(e.projectionMatrix,e.maxFar||1e4),!0===e.reversedDepth&&(this.zNear=1,this.zFar=0)}setFromProjectionMatrix(e,t){let a=this.zNear,i=this.zFar,o=0===e.elements[11];return r.copy(e).invert(),this.vertices.near[0].set(1,1,a),this.vertices.near[1].set(1,-1,a),this.vertices.near[2].set(-1,-1,a),this.vertices.near[3].set(-1,1,a),this.vertices.near.forEach(function(e){e.applyMatrix4(r)}),this.vertices.far[0].set(1,1,i),this.vertices.far[1].set(1,-1,i),this.vertices.far[2].set(-1,-1,i),this.vertices.far[3].set(-1,1,i),this.vertices.far.forEach(function(e){e.applyMatrix4(r);let a=Math.abs(e.z);o?e.z*=Math.min(t/a,1):e.multiplyScalar(Math.min(t/a,1))}),this.vertices}split(e,t){for(;e.length>t.length;)t.push(new i);t.length=e.length;let a=this.vertices.near[0].z,r=this.vertices.far[0].z;for(let i=0;i<e.length;i++){let o=t[i];if(0===i)for(let e=0;e<4;e++)o.vertices.near[e].copy(this.vertices.near[e]);else{let t=(e[i-1]*r-a)/(r-a);for(let e=0;e<4;e++)o.vertices.near[e].lerpVectors(this.vertices.near[e],this.vertices.far[e],t)}if(i===e.length-1)for(let e=0;e<4;e++)o.vertices.far[e].copy(this.vertices.far[e]);else{let t=(e[i]*r-a)/(r-a);for(let e=0;e<4;e++)o.vertices.far[e].lerpVectors(this.vertices.near[e],this.vertices.far[e],t)}}}toSpace(e,t){for(let a=0;a<4;a++)t.vertices.near[a].copy(this.vertices.near[a]).applyMatrix4(e),t.vertices.far[a].copy(this.vertices.far[a]).applyMatrix4(e)}}let o={lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

vec3 geometryClearcoatNormal = vec3( 0.0 );

#ifdef USE_CLEARCOAT

	geometryClearcoatNormal = clearcoatNormal;

#endif

#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		// Iridescence F0 approximation
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif

IncidentLight directLight;

#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		pointLight = pointLights[ i ];

		getPointLightInfo( pointLight, geometryPosition, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;

		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

	SpotLight spotLight;
 	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;

	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		spotLight = spotLights[ i ];

		getSpotLightInfo( spotLight, geometryPosition, directLight );

  		// spot lights are ordered [shadows with maps, shadows without maps, maps without shadows, none]
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;

		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct ) && defined( USE_CSM ) && defined( CSM_CASCADES )

	DirectionalLight directionalLight;
	float linearDepth = (vViewPosition.z) / (shadowFar - cameraNear);
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	#if defined( USE_SHADOWMAP ) && defined( CSM_FADE )
		vec2 cascade;
		float cascadeCenter;
		float closestEdge;
		float margin;
		float csmx;
		float csmy;

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

			directionalLight = directionalLights[ i ];
			getDirectionalLightInfo( directionalLight, directLight );

			#if ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
				// NOTE: Depth gets larger away from the camera.
				// cascade.x is closer, cascade.y is further
				cascade = CSM_cascades[ i ];
				cascadeCenter = ( cascade.x + cascade.y ) / 2.0;
				closestEdge = linearDepth < cascadeCenter ? cascade.x : cascade.y;
				margin = 0.25 * pow( closestEdge, 2.0 );
				csmx = cascade.x - margin / 2.0;
				csmy = cascade.y + margin / 2.0;
				if( linearDepth >= csmx && ( linearDepth < csmy || UNROLLED_LOOP_INDEX == CSM_CASCADES - 1 ) ) {

					float dist = min( linearDepth - csmx, csmy - linearDepth );
					float ratio = clamp( dist / margin, 0.0, 1.0 );

					vec3 prevColor = directLight.color;
					directionalLightShadow = directionalLightShadows[ i ];
					directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;

					bool shouldFadeLastCascade = UNROLLED_LOOP_INDEX == CSM_CASCADES - 1 && linearDepth > cascadeCenter;
					directLight.color = mix( prevColor, directLight.color, shouldFadeLastCascade ? ratio : 1.0 );

					ReflectedLight prevLight = reflectedLight;
					RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

					bool shouldBlend = UNROLLED_LOOP_INDEX != CSM_CASCADES - 1 || UNROLLED_LOOP_INDEX == CSM_CASCADES - 1 && linearDepth < cascadeCenter;
					float blendRatio = shouldBlend ? ratio : 1.0;

					reflectedLight.directDiffuse = mix( prevLight.directDiffuse, reflectedLight.directDiffuse, blendRatio );
					reflectedLight.directSpecular = mix( prevLight.directSpecular, reflectedLight.directSpecular, blendRatio );
					reflectedLight.indirectDiffuse = mix( prevLight.indirectDiffuse, reflectedLight.indirectDiffuse, blendRatio );
					reflectedLight.indirectSpecular = mix( prevLight.indirectSpecular, reflectedLight.indirectSpecular, blendRatio );

				}
			#endif

		}
		#pragma unroll_loop_end
	#elif defined (USE_SHADOWMAP)

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

			directionalLight = directionalLights[ i ];
			getDirectionalLightInfo( directionalLight, directLight );

			#if ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )

				directionalLightShadow = directionalLightShadows[ i ];
				if(linearDepth >= CSM_cascades[UNROLLED_LOOP_INDEX].x && linearDepth < CSM_cascades[UNROLLED_LOOP_INDEX].y) directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;

				if(linearDepth >= CSM_cascades[UNROLLED_LOOP_INDEX].x && (linearDepth < CSM_cascades[UNROLLED_LOOP_INDEX].y || UNROLLED_LOOP_INDEX == CSM_CASCADES - 1)) RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

			#endif

		}
		#pragma unroll_loop_end

	#elif ( NUM_DIR_LIGHT_SHADOWS > 0 )
		// note: no loop here - all CSM lights are in fact one light only
		getDirectionalLightInfo( directionalLights[0], directLight );
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	#endif

	#if ( NUM_DIR_LIGHTS > NUM_DIR_LIGHT_SHADOWS)
		// compute the lights not casting shadows (if any)

		#pragma unroll_loop_start
		for ( int i = NUM_DIR_LIGHT_SHADOWS; i < NUM_DIR_LIGHTS; i ++ ) {

			directionalLight = directionalLights[ i ];

			getDirectionalLightInfo( directionalLight, directLight );

			RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

		}
		#pragma unroll_loop_end

	#endif

#endif


#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct ) && !defined( USE_CSM ) && !defined( CSM_CASCADES )

	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		directionalLight = directionalLights[ i ];

		getDirectionalLightInfo( directionalLight, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

	RectAreaLight rectAreaLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if defined( RE_IndirectDiffuse )

	vec3 iblIrradiance = vec3( 0.0 );

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	#if defined( USE_LIGHT_PROBES )

		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );

	#endif

	#if ( NUM_HEMI_LIGHTS > 0 )

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );

		}
		#pragma unroll_loop_end

	#endif

#endif

#if defined( RE_IndirectSpecular )

	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );

#endif
`,lights_pars_begin:`
#if defined( USE_CSM ) && defined( CSM_CASCADES )
uniform vec2 CSM_cascades[CSM_CASCADES];
uniform float cameraNear;
uniform float shadowFar;
#endif
	`+a.Y.lights_pars_begin};e.s(["CSMShader",0,o],44628);let n=new t.nd,l=new i({webGL:!0}),s=new t.cE,c=new t.cE,f=new t.VQ,h=[],u=[],d=new t.nd,m=new t.nd,p=new t.cE(0,1,0);e.s(["f",0,class{constructor(e){this.camera=e.camera,this.parent=e.parent,this.cascades=e.cascades||3,this.maxFar=e.maxFar||1e5,this.mode=e.mode||"practical",this.shadowMapSize=e.shadowMapSize||2048,this.shadowBias=e.shadowBias||1e-6,this.lightDirection=e.lightDirection||new t.cE(1,-1,1).normalize(),this.lightIntensity=e.lightIntensity||3,this.lightNear=e.lightNear||1,this.lightFar=e.lightFar||2e3,this.lightMargin=e.lightMargin||200,this.customSplitsCallback=e.customSplitsCallback,this.fade=!1,this.mainFrustum=new i({webGL:!0}),this.frustums=[],this.breaks=[],this.lights=[],this.shaders=new Map,this._createLights(),this.updateFrustums(),this._injectInclude()}_createLights(){for(let e=0;e<this.cascades;e++){let e=new t.ya(0xffffff,this.lightIntensity);e.castShadow=!1,e.shadow.mapSize.width=this.shadowMapSize,e.shadow.mapSize.height=this.shadowMapSize,e.shadow.camera.near=this.lightNear,e.shadow.camera.far=this.lightFar,e.shadow.bias=this.shadowBias,this.parent.add(e),this.parent.add(e.target),this.lights.push(e)}}_initCascades(){let e=this.camera;e.updateProjectionMatrix(),this.mainFrustum.setFromProjectionMatrix(e.projectionMatrix,this.maxFar),this.mainFrustum.split(this.breaks,this.frustums)}_updateShadowBounds(){let e=this.frustums;for(let t=0;t<e.length;t++){let e,a=this.lights[t].shadow.camera,r=this.frustums[t],i=r.vertices.near,o=r.vertices.far,n=o[0];e=n.distanceTo(o[2])>n.distanceTo(i[2])?o[2]:i[2];let l=n.distanceTo(e);if(this.fade){let e=this.camera,t=Math.max(e.far,this.maxFar);l+=.25*Math.pow(r.vertices.far[0].z/(t-e.near),2)*(t-e.near)}a.left=-l/2,a.right=l/2,a.top=l/2,a.bottom=-l/2,a.updateProjectionMatrix()}}_getBreaks(){let e=this.camera,a=Math.min(e.far,this.maxFar);switch(this.breaks.length=0,this.mode){case"uniform":r(this.cascades,e.near,a,this.breaks);break;case"logarithmic":i(this.cascades,e.near,a,this.breaks);break;case"practical":!function(e,a,o,n){h.length=0,u.length=0,i(e,a,o,u),r(e,a,o,h);for(let a=1;a<e;a++)n.push(t.rB.lerp(h[a-1],u[a-1],.5));n.push(1)}(this.cascades,e.near,a,this.breaks);break;case"custom":void 0===this.customSplitsCallback&&console.error("CSM: Custom split scheme callback not defined."),this.customSplitsCallback(this.cascades,e.near,a,this.breaks)}function r(e,t,a,r){for(let i=1;i<e;i++)r.push((t+(a-t)*i/e)/a);r.push(1)}function i(e,t,a,r){for(let i=1;i<e;i++)r.push(t*(a/t)**(i/e)/a);r.push(1)}}update(){let e=this.camera,t=this.frustums;d.lookAt(c,this.lightDirection,p),m.copy(d).invert();for(let a=0;a<t.length;a++){let r=this.lights[a],i=r.shadow.camera,o=(i.right-i.left)/this.shadowMapSize,c=(i.top-i.bottom)/this.shadowMapSize;n.multiplyMatrices(m,e.matrixWorld),t[a].toSpace(n,l);let h=l.vertices.near,u=l.vertices.far;f.makeEmpty();for(let e=0;e<4;e++)f.expandByPoint(h[e]),f.expandByPoint(u[e]);f.getCenter(s),s.z=f.max.z+this.lightMargin,s.x=Math.floor(s.x/o)*o,s.y=Math.floor(s.y/c)*c,s.applyMatrix4(d),r.position.copy(s),r.target.position.copy(s),r.target.position.x+=this.lightDirection.x,r.target.position.y+=this.lightDirection.y,r.target.position.z+=this.lightDirection.z}}_injectInclude(){a.Y.lights_fragment_begin=o.lights_fragment_begin,a.Y.lights_pars_begin=o.lights_pars_begin}setupMaterial(e){e.defines=e.defines||{},e.defines.USE_CSM=1,e.defines.CSM_CASCADES=this.cascades,this.fade&&(e.defines.CSM_FADE="");let t=[],a=this,r=this.shaders;e.onBeforeCompile=function(i){let o=Math.min(a.camera.far,a.maxFar);a._getExtendedBreaks(t),i.uniforms.CSM_cascades={value:t},i.uniforms.cameraNear={value:a.camera.near},i.uniforms.shadowFar={value:o},r.set(e,i)},r.set(e,null)}_updateUniforms(){let e=Math.min(this.camera.far,this.maxFar);this.shaders.forEach(function(t,a){if(null!==t){let a=t.uniforms;this._getExtendedBreaks(a.CSM_cascades.value),a.cameraNear.value=this.camera.near,a.shadowFar.value=e}!this.fade&&"CSM_FADE"in a.defines?(delete a.defines.CSM_FADE,a.needsUpdate=!0):!this.fade||"CSM_FADE"in a.defines||(a.defines.CSM_FADE="",a.needsUpdate=!0)},this)}_getExtendedBreaks(e){for(;e.length<this.breaks.length;)e.push(new t.wq);e.length=this.breaks.length;for(let t=0;t<this.cascades;t++){let a=this.breaks[t],r=this.breaks[t-1]||0;e[t].x=r,e[t].y=a}}updateFrustums(){this._getBreaks(),this._initCascades(),this._updateShadowBounds(),this._updateUniforms()}remove(){for(let e=0;e<this.lights.length;e++)this.parent.remove(this.lights[e].target),this.parent.remove(this.lights[e])}dispose(){let e=this.shaders;e.forEach(function(e,t){delete t.onBeforeCompile,delete t.defines.USE_CSM,delete t.defines.CSM_CASCADES,delete t.defines.CSM_FADE,null!==e&&(delete e.uniforms.CSM_cascades,delete e.uniforms.cameraNear,delete e.uniforms.shadowFar),t.needsUpdate=!0}),e.clear()}}],8937)},46899,76156,e=>{var t=e.i(43476),a=e.i(71645),r=e.i(38408),i=e.i(90072),o=e.i(53688),n=e.i(27225),l=e.i(98903),s=e.i(8560),c=e.i(8937),f=e.i(44628),h=e.i(75152),u=e.i(8175),d=e.i(17829),m=e.i(99372),p=e.i(78176),g=e.i(35979),v=e.i(66426),x=e.i(78785);(0,m.a)(),!function(){let e=f.CSMShader,t=s.Y.lights_fragment_begin;if(e.lights_fragment_begin.includes("material.dfg")||new URLSearchParams(window.location.search).has("nospec"))return;let a=t.search(/#ifdef STANDARD\s+float dotNVms/),r=t.indexOf("IncidentLight directLight;");a<0||r<a?console.warn("[film] three's lights chunk changed: CSM's reflections may be missing"):e.lights_fragment_begin=e.lights_fragment_begin.replace("IncidentLight directLight;",`${t.slice(a,r)}IncidentLight directLight;`)}();let y=`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * p;
  gl_Position.z = gl_Position.w; // pin to the far plane
}`,w=`
uniform vec3 uSunDir;
uniform vec3 uMoonDir;
uniform float uAlt;
uniform float uNight;
uniform float uStudio;
uniform float uTime;
uniform float uCirrus;
uniform float uEnv;
uniform float uQuality;
uniform sampler2D uMoonTex;
uniform vec3 fogSunDir;
uniform vec3 fogColSun;
uniform vec3 fogColSide;
uniform vec3 fogColAway;
uniform vec3 fogColGlow;
varying vec3 vDir;
${p.U}
${m.O}

float sh(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float sn(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = sh(vec3(i, 0.0)), b = sh(vec3(i + vec2(1, 0), 0.0)), c = sh(vec3(i + vec2(0, 1), 0.0)), d = sh(vec3(i + vec2(1, 1), 0.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
float sfbm(vec2 p) { float v = 0.0; float a = 0.5; mat2 r = mat2(0.8, 0.6, -0.6, 0.8); for (int i = 0; i < 5; i++) { v += a * sn(p); p = r * p * 2.03; a *= 0.5; } return v; }

void main() {
  vec3 d = normalize(vDir);
  int iS = uQuality > 0.5 ? 16 : 10;
  int jS = uQuality > 0.5 ? 8 : 5;
  vec3 col = atmosphere(d, uAlt, uSunDir, 22.0, iS, jS);
  // below the horizon the dome meets the world's haze exactly
  if (uEnv < 0.5) col = mix(hazeColor(d), col, smoothstep(-0.005, 0.035, d.y));

  // high cirrus / altocumulus deck at 8 km, lit by the transmitted sun
  if (d.y > 0.0 && uCirrus > 0.0) {
    float t = (8000.0 - uAlt) / max(d.y, 0.02);
    vec2 cp = (d.xz * t) * 0.00011 + vec2(uTime * 0.0015, uTime * 0.0006);
    float n = sfbm(cp) * 0.7 + sfbm(cp * 3.7 + 2.3) * 0.3;
    float cov = smoothstep(0.52 - uCirrus * 0.2, 0.86, n) * smoothstep(0.0, 0.18, d.y);
    vec3 sunT = atmoTransmittance(uSunDir, 8000.0);
    float fwd = pow(max(dot(d, uSunDir), 0.0), 6.0);
    vec3 lit = sunT * (0.55 + 1.4 * fwd) * 0.9 + col * 0.6;
    // clouds catch light after sunset from below the horizon: pinks & oranges
    lit += vec3(0.9, 0.38, 0.22) * smoothstep(0.0, -0.12, uSunDir.y) * smoothstep(-0.2, -0.04, uSunDir.y) * 0.5;
    col = mix(col, lit, cov * 0.85 * (1.0 - uNight * 0.85));
  }

  if (uEnv < 0.5) {
    // sun disc with limb darkening
    float cs = dot(d, uSunDir);
    float disc = smoothstep(0.99996, 0.99999, cs);
    vec3 T = atmoTransmittance(uSunDir, uAlt);
    col += disc * T * 260.0 * (0.6 + 0.4 * smoothstep(0.99996, 1.0, cs));
  } else if (d.y < 0.03) {
    // reflections: a dark city skyline and streets below the horizon, not bright haze
    float sky = smoothstep(-0.02, 0.03, d.y);
    vec3 ground = col * 0.18 + vec3(0.012, 0.013, 0.015);
    col = mix(ground, col, sky);
  }

  // night: deep blue base, stars, the moon, and the city's glow on the horizon
  if (uNight > 0.001) {
    col += vec3(0.0015, 0.0025, 0.006) * uNight * (0.4 + 0.6 * smoothstep(-0.1, 0.6, d.y));
    vec3 sp = d * 380.0;
    float star = sh(floor(sp));
    vec3 fp = fract(sp) - 0.5;
    float s = smoothstep(0.1, 0.0, length(fp)) * step(0.982, star);
    float tw = 0.55 + 0.45 * sin(uTime * 1.7 + star * 90.0);
    float sky = dot(col, vec3(0.3, 0.5, 0.2));
    col += vec3(0.85, 0.9, 1.0) * s * tw * uNight * smoothstep(0.03, 0.25, d.y) * (1.0 - smoothstep(0.0, 0.12, sky)) * 0.9;
    col += vec3(0.9, 0.48, 0.2) * 0.035 * exp(-max(d.y, 0.0) * 14.0) * uNight;
    if (uEnv < 0.5) {
      float md = acos(clamp(dot(d, uMoonDir), -1.0, 1.0));
      float R = 0.012;
      vec3 mx = normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0)));
      vec3 my = cross(mx, uMoonDir);
      vec2 muv = vec2(dot(d, mx), dot(d, my)) / R * 0.5 + 0.5;
      float inDisc = smoothstep(R, R * 0.97, md);
      vec3 moon = texture2D(uMoonTex, muv).rgb * vec3(1.0, 0.97, 0.92) * 1.6;
      col = mix(col, moon, inDisc * uNight);
      col += vec3(0.5, 0.6, 0.8) * 0.06 * exp(-md * 18.0) * uNight;
    }
  }
  vec3 studio = vec3(0.006, 0.006, 0.007) + vec3(0.012) * smoothstep(-0.2, 0.7, d.y);
  col = mix(col, studio, uStudio);
  gl_FragColor = vec4(col, 1.0);
}`;function b(e,t){return new i.Zg({vertexShader:y,fragmentShader:w,side:i.tw,depthWrite:!1,depthTest:!t,fog:!1,toneMapped:!1,uniforms:{uSunDir:{value:new i.cE(0,1,0)},uMoonDir:{value:d._.moonDir},uAlt:{value:10},uNight:{value:0},uStudio:{value:0},uTime:u.f.uTime,uCirrus:{value:.3},uEnv:{value:+!!t},uQuality:{value:1},uMoonTex:{value:e},...m.K}})}let M=e=>e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial,S=null,_=new i.cE,L={high:[1,1,2,4],medium:[1,2,4,8],low:[1,2,4,8]},E=new i.cE(1e9,0,0);function A(e){let t=S;t&&e.traverse(e=>{if(e.isMesh)for(let a of Array.isArray(e.material)?e.material:[e.material])a&&M(a)&&function(e,t){if(t.isDerivedMaterial||t.userData.__csm||t.userData.noCSM)return;t.userData.__origHook||(t.userData.__origHook=t.onBeforeCompile,t.userData.__origKey=t.customProgramCacheKey!==i.C2.prototype.customProgramCacheKey?t.customProgramCacheKey():"");let a=t.userData.__origHook,r=t.userData.__origKey;e.setupMaterial(t);let o=t.onBeforeCompile;t.onBeforeCompile=(e,r)=>{a.call(t,e,r),o.call(t,e,r)},t.customProgramCacheKey=()=>`${r}|csm`,t.userData.__csm=!0,t.needsUpdate=!0}(t,a)})}let C=new i.cE(.55,-.7,-.45).normalize(),D=new i.Es("#ffe6c4"),z=new i.cE,k=new i.Es,R=new i.Es,T=new i.Es(.05,.045,.05);e.s(["U",0,function(){let{scene:e,camera:o,gl:f}=(0,r.f)(),u=(0,n.f)(e=>e.quality),y=(0,a.useMemo)(()=>{let e=new i.H5().load("/textures/moon.jpg");return e.colorSpace=i.nj,e},[]),w=(0,a.useMemo)(()=>{let e=new i.kE(new i.Gu(1,48,24),b(y,!1));return e.frustumCulled=!1,e.renderOrder=-100,e},[y]),M=(0,a.useMemo)(()=>{let e=new i.P6,t=b(null,!0),a=new i.kE(new i.Gu(100,32,16),t);return e.add(a),{envScene:e,mat:t,pmrem:new s.c(f),target:null,last:new i.$i(9,9,9,9),at:-1e9}},[f]);(0,a.useEffect)(()=>()=>{M.target?.dispose(),M.pmrem.dispose()},[M]);let N=(0,a.useMemo)(()=>new i.IM("#b9c8d6",15e-5),[]),F=(0,a.useRef)(null);(0,a.useEffect)(()=>{let t="high"===n.f.getState().quality&&!x.u,a=new c.f({camera:o,parent:e,cascades:t?4:3,maxFar:x.u?2500:4e3,mode:"practical",shadowMapSize:t?2048:1024,shadowBias:-1e-4,lightDirection:new i.cE(-.5,-.6,.4).normalize(),lightIntensity:3,lightNear:1,lightFar:9e3,lightMargin:900});for(let e of(a.fade=!0,a.lights))e.shadow.normalBias=.3;return F.current=a,S=a,e.traverse(e=>{if(e.isMesh)for(let t of Array.isArray(e.material)?e.material:[e.material])t&&delete t.userData.__csm}),()=>{for(let e of(a.dispose(),a.lights))e.parent?.remove(e);F.current=null,S===a&&(S=null),e.traverse(e=>{if(e.isMesh)for(let t of Array.isArray(e.material)?e.material:[e.material])t?.userData.__origHook&&(t.onBeforeCompile=t.userData.__origHook,delete t.userData.__csm,t.needsUpdate=!0)})}},[o,e]),(0,a.useEffect)(()=>(e.add(w),()=>{e.remove(w)}),[e,w]);let P=(0,a.useRef)(null),I=(0,a.useRef)(0),B=(0,a.useRef)(0),U=(0,a.useMemo)(()=>new i.Es,[]);return(0,a.useEffect)(()=>(e.fog=N,()=>{e.fog=null}),[e,N]),(0,l.f)(()=>{var t,a,r,l;let s=n.$.p,c=(0,h.B)(s),y=F.current;w.visible=!c,(0,d.F)(Math.max(s,h.A));let b=M.last;if((!x.u||I.current-M.at>=8)&&(Math.abs(b.x-d._.sunDir.x)+Math.abs(b.y-d._.sunDir.y)+Math.abs(b.z-d._.sunDir.z)>.012||Math.abs(b.w-(d._.night+2*d._.studio))>.03)){M.at=I.current;let i=M.mat.uniforms;if(i.uSunDir.value.copy(d._.sunDir),i.uAlt.value=120,i.uNight.value=d._.night,i.uStudio.value=d._.studio,i.uCirrus.value=d._.cirrus,M.target){let e,i,o;t=M.pmrem,a=M.envScene,r=M.target,e=f.getRenderTarget(),i=f.getActiveCubeFace(),o=f.getActiveMipmapLevel(),t._setSize(256),t._sceneToCubeUV(a,1,1e3,r,_),t._applyPMREM(r),r.scissorTest=!1,r.viewport.set(0,0,r.width,r.height),r.scissor.set(0,0,r.width,r.height),f.setRenderTarget(e,i,o)}else M.target=M.pmrem.fromScene(M.envScene,0,1,1e3),e.environment=M.target.texture;b.set(d._.sunDir.x,d._.sunDir.y,d._.sunDir.z,d._.night+2*d._.studio)}if(y){let t,a;(Math.abs(o.fov-B.current)>.05||I.current%20==0)&&(y.updateFrustums(),B.current=o.fov),l=I.current,t=L[x.u&&"high"===u?"medium":u],a=o.position.distanceToSquared(E)>22500,E.copy(o.position),y.lights.forEach((e,r)=>{let i=t[Math.min(r,t.length-1)];e.shadow.autoUpdate=!1,(a||1===i||(l+r)%i==0)&&(e.shadow.needsUpdate=!1)}),I.current++%30==0&&A(e)}let S=P.current;if(c){if(N.density=0,e.environmentIntensity=0,v.r.bias=1,v.r.strength=0,S&&(S.color.set("#9fc0ff"),S.groundColor.set("#1a1a1c"),S.intensity=.16),y){for(let e of(y.lightDirection.copy(g.m).negate(),y.lights))e.color.set("#fffaf2"),e.intensity=10;y.update()}return}S&&(S.color.set("#c8ccd8"),S.groundColor.set("#141416"),S.intensity=.35*d._.studio);let H=Math.max(o.position.y,1);v.r.bias=d._.exposure,v.r.strength=.75*(1-.5*d._.night)*(1-.6*d._.studio);let j=w.material.uniforms;j.uSunDir.value.copy(d._.sunDir),j.uAlt.value=H,j.uNight.value=d._.night,j.uStudio.value=d._.studio,j.uCirrus.value=d._.cirrus,j.uQuality.value=+("high"===u&&!x.u),w.position.copy(o.position),w.scale.setScalar(.9*o.far);let W=Math.atan2(d._.sunDir.x,d._.sunDir.z),O=Math.min(H,2500),G=(e,t)=>(z.set(Math.sin(e),.035,Math.cos(e)).normalize(),(0,p.b)(z,O,d._.sunDir,22,t),t.lerp(T,.9*d._.night).lerp(k.setRGB(.008,.008,.009),d._.studio));if(G(W+.75,m.K.fogColSun.value).add(G(W-.75,R)).multiplyScalar(.5),G(W+Math.PI/2,m.K.fogColSide.value).add(G(W-Math.PI/2,R)).multiplyScalar(.5),G(W+Math.PI,m.K.fogColAway.value),(0,p.i)(d._.sunDir,O,m.K.fogColGlow.value).multiplyScalar(.35*i.rB.smoothstep(d._.elev,-2,3)*(1-d._.studio)),m.K.fogSunDir.value.copy(d._.sunDir),N.density=d._.fogDensity*(1-d._.studio),N.color.copy(m.K.fogColSide.value),e.environmentIntensity=1-.85*d._.studio,m.c.value=.75,!y)return;let q=d._.elev<-3;q?(U.set("#9fb4ff"),y.lightDirection.copy(d._.moonDir).negate()):((0,p.i)(d._.sunDir,H,U),y.lightDirection.copy(d._.sunDir).negate());let $=q?.35*d._.night:9.5*i.rB.smoothstep(d._.elev,-1.5,2.5);for(let e of(d._.studio>0&&(y.lightDirection.lerp(C,d._.studio).normalize(),U.lerp(D,d._.studio),$=i.rB.lerp($,5.5,d._.studio)),y.lights))e.color.copy(U),e.intensity=$;y.update()}),(0,t.jsx)("hemisphereLight",{ref:P,intensity:0})},"e",0,A],76156);var N=e.i(66242);let F=new Set,P=(0,a.createContext)(null);function I(){let e=(0,a.useContext)(P);return(0,a.useLayoutEffect)(()=>{if(e)return e.n++,()=>{e.n--}},[e]),null}class B extends a.Component{state={failed:!1};static getDerivedStateFromError(){return{failed:!0}}componentDidCatch(e){console.error("[film] left a part out that failed to load:",e),(0,x.C)(`left out a part: ${String(e).slice(0,100)}`)}render(){return this.state.failed?null:this.props.children}}let U=()=>new Promise(e=>requestAnimationFrame(()=>e())),H=0,j=!1;function W(){if(j)return;j=!0,H=performance.now();let e=()=>{(Math.abs(n.$.velocity)>5e-4||Math.abs(n.$.target-n.$.p)>1e-4)&&(H=performance.now()),requestAnimationFrame(e)};requestAnimationFrame(e)}async function O(){if(!(0,n.n)())return;W();let e=performance.now();for(;performance.now()-H<300&&performance.now()-e<3e3;)await U()}let G=-1/0,q=0,$=null;function V({pass:e,children:t}){if(!e.granted&&(0,n.n)()){W();let e=performance.now();!(e-H>=300||q>0&&e-q>3e3)||e-G<32?(q||(q=e),(0,a.use)($??=new Promise(e=>setTimeout(e,50)).then(()=>void($=null)))):(G=e,q=0)}return e.granted=!0,t}let K=e=>!!(e.isMesh||e.isPoints||e.isLine||e.isSprite);async function Z(e,t,a,r,o,n,l,s,c,f){for((0,x.C)(`${c}: loading`);s.n>0;)if(await U(),!n())return;if((0,x.C)(`${c}: loaded`),f(),await U(),await U(),await O(),!n())return;A(r);let h=new i.qL(4,4,{type:i.HN}),u=t=>{let a=e.getRenderTarget();e.setRenderTarget(h);try{return t()}finally{e.setRenderTarget(a)}};try{let s=function e(t,a=80){let r=0;return(t.traverse(e=>{K(e)&&r++}),0===r)?[]:r<=a||K(t)||0===t.children.length?[t]:t.children.flatMap(t=>e(t,a))}(r),f=new Set,h=performance.now();for(let r=0;r<s.length;r++)if(u(()=>e.compile(s[r],a,t)).forEach(e=>f.add(e)),performance.now()-h>8){if(o(.1*(r/s.length)),await U(),await O(),!n())return;h=performance.now()}if(l)for(let r of(A(t),u(()=>e.compile(t,a)).forEach(e=>f.add(e)),F))u(()=>e.compile(r.scene,r.camera)).forEach(e=>f.add(e));(0,x.C)(`${c}: compiling ${f.size}`);let d=[...f],m=Math.max(1,d.length);for(;d.length;)if(d=d.filter(t=>{let a=e.properties.get(t).currentProgram;return!!a&&!a.isReady()}),o(.1+.6*(1-d.length/m)),d.length&&(await U(),!n()))return;let p=new Set;for(let t of f)!function(e,t,a){let r=e=>{if(!e||"object"!=typeof e)return;if(Array.isArray(e))return e.forEach(r);if(!e.isTexture||e.isRenderTargetTexture||0===e.version)return;let t=e.image;t&&!1!==t.complete&&a.add(e)};for(let e of Object.values(t))r(e);let i=t.uniforms;if(i)for(let e in i)r(i[e]?.value);let o=e.properties.get(t).uniforms;if(o)for(let e in o)r(o[e]?.value)}(e,t,p);let g=[...p];if((0,x.C)(`${c}: uploading ${g.length} textures`),await (0,x.Q)(g,t=>!!e.properties.get(t).__webglInit),!n())return;h=performance.now();for(let t=0;t<g.length;t++)if(e.initTexture(g[t]),performance.now()-h>6){if(o(.7+.1*(t/g.length)),await U(),await O(),!n())return;h=performance.now()}(0,x.B)(g,t=>{let a=e.properties.get(t);return!!a.__webglInit&&a.__version===t.version}),(0,x.C)(`${c}: drawing ${s.length} parts`);let v=new i.zm(60,1,.1,1e6);v.layers.set(31);let y=[];t.traverseVisible(e=>{e.isLight&&!e.layers.isEnabled(31)&&y.push(e)});let w=0;for(;w<s.length;){if(await O(),!n())return;let a=performance.now(),r=[],i=e=>{r.push([e,e.visible,e.frustumCulled,e.layers.isEnabled(31),e.castShadow]),e.visible=!0,e.frustumCulled=!1},l=0;for(;w<s.length&&l<120;w++){s[w].traverse(e=>{i(e),e.layers.enable(31),e.castShadow=!1,K(e)&&l++});for(let e=s[w].parent;e&&e!==t;e=e.parent)i(e)}let c=()=>{for(let e of y)e.shadow&&(e.shadow.needsUpdate=!1)};for(let e of y)e.layers.enable(31);try{c(),u(()=>e.render(t,v))}finally{for(let e of(c(),y))e.layers.disable(31);for(let e=r.length-1;e>=0;e--){let[t,a,i,o,n]=r[e];t.visible=a,t.frustumCulled=i,t.castShadow=n,o||t.layers.disable(31)}}o(.8+.2*(w/s.length)),await U(),performance.now()-a>30&&await U()}if(l)for(let t of F)t.draw&&n()&&(t.draw(e),await U());o(1),(0,x.C)(`${c}: ready`)}finally{h.dispose()}}e.s(["H",0,function({children:e}){let r=(0,a.useRef)({granted:!1}).current;return(0,t.jsx)(B,{children:(0,t.jsx)(a.Suspense,{fallback:(0,t.jsx)(I,{}),children:(0,t.jsx)(V,{pass:r,children:e})})})},"U",0,function({stage:e,onReady:i,onLoaded:n,extra:l=!1,children:s}){let c=(0,a.useRef)(null),f=(0,r.f)(e=>e.gl),h=(0,r.f)(e=>e.scene),u=(0,r.f)(e=>e.camera);(0,a.useState)(()=>(0,N.d)(e));let d=(0,a.useRef)(i),m=(0,a.useRef)(n),p=(0,a.useRef)({n:0}).current;return(0,a.useEffect)(()=>{d.current=i,m.current=n}),(0,a.useEffect)(()=>{let t=c.current;if(!t)return;let a=!0;return Z(f,h,u,t,t=>o.f[e]=Math.max(o.f[e],t),()=>a,l,p,e,()=>m.current?.()).then(()=>{a&&(t.visible=!0,o.f[e]=1,d.current())}),()=>{a=!1}},[f,h,u,e,l,p]),(0,l.f)(()=>{let g=c.current;if(!g||!o.f[e])return;let p=n.$.p,v="city"===e?p<=.28:"street"===e?p>=.16&&p<=.44:"water"===e?p>=.33&&p<=.52:p>=.4;g.visible!==v&&(g.visible=v)}),(0,t.jsx)(P.Provider,{value:p,children:(0,t.jsx)("group",{ref:c,visible:!1,children:s})})},"u",0,F,"p",0,O],46899)},15577,33372,6193,e=>{var t=e.i(43476),a=e.i(71645),r=e.i(84670),i=e.i(56863),o=e.i(81556),n=e.i(64162),l=e.i(94172),s=e.i(27391),c=e.i(38316),f=e.i(96377),h=e.i(92827),u=e.i(16328),d=e.i(652),m=e.i(98903),p=e.i(42463),g=e.i(90072),v=e.i(52260),x=e.i(55851),y=e.i(99372),w=e.i(78785),b=e.i(83927),M=e.i(54102),S=e.i(78952),_=e.i(88699),L=e.i(45128),E=e.i(68818),A=e.i(46899),C=e.i(18456);let D=new g.nd,z=new g.as,k=new g.cE,R=new g.cE,T=new g.cE(0,1,0),N=w.u?3e3:1200,F=w.u?300:650,P=w.u?3e3:6500,I=[{name:"street",grid:8,height:4.5567,radius:3.4877,mesh:!1},{name:"elm1",grid:8,height:24.833,radius:19.851,mesh:!0},{name:"elm2",grid:8,height:31.342,radius:27.357,mesh:!0},{name:"elm3",grid:8,height:32.536,radius:26.395,mesh:!0},{name:"elm4",grid:8,height:24.055,radius:20.998,mesh:!0},{name:"oak1",grid:8,height:26.515,radius:21.163,mesh:!0},{name:"oak2",grid:8,height:19.625,radius:16.387,mesh:!0}],B=w.u?36:50,U=w.u?12:28,H=I.filter(e=>e.mesh).map(e=>(0,w.Z)(`/models/trees/${e.name}.glb`));(0,C.D)("street",H);let j=[2,3,2,1,3,0,1],W=[2,2,1,1,2,3,3],O=I.flatMap(e=>[`/textures/trees/${e.name}_albedo.webp`,`/textures/trees/${e.name}_normal.webp`]);(0,p.I)("street",O);let G=(e,t)=>1e5*Math.floor(e/64)+Math.floor(t/64);function q({plan:e}){let i=(0,p.q)(O),o=(0,a.useMemo)(()=>I.map((e,t)=>{let a=i[2*t],r=i[2*t+1];for(let t of(a.colorSpace=g.nj,r.colorSpace=g.Ik,w.u&&(r.userData.phoneMax="street"===e.name?512:256),[a,r]))t.anisotropy=8,t.minFilter=g.Q4,t.generateMipmaps=!0;return(0,M.s)({albedo:a,normal:r,...e})}),[i]),n=(0,a.useMemo)(()=>{let t=(0,x.f)(5),a=new Map,i=[],n=(e,r,i,o,n)=>{let l=function(e,t){let a=t*e.reduce((e,t)=>e+t,0);for(let t=0;t<e.length;t++)if((a-=e[t])<0)return t;return e.length-1}(n,t()),s=`${l}:${Math.floor(e/N)},${Math.floor(i/N)}`,c=a.get(s);c||a.set(s,c={kind:l,items:[]}),c.items.push({x:e,y:r,z:i,s:o/I[l].height,yaw:t()*Math.PI*2,tint:.82+.32*t()})};for(let[a,,r,i]of e.parkTrees)n(a,0,r,(1.5+1.1*i)*4.56*(.9+.25*t()),W);for(let[a,,i]of e.streetTrees)n(a,r.C,i,8.4+2.8*t(),j);let l=[];for(let{kind:e,items:t}of a.values()){t.forEach((t,a)=>i.push({kind:e,chunk:l.length,i:a,...t}));let{mat:a,depth:r}=o[e],n=new g.kE((0,M.r)(t,I[e]),a);n.customDepthMaterial=r,n.receiveShadow=!0,n.matrixAutoUpdate=!1;let s=0,c=0;for(let e of t)s+=e.x/t.length,c+=e.z/t.length;let f=0;for(let e of t)f=Math.max(f,Math.hypot(e.x-s,e.z-c));l.push({mesh:n,cx:s,cz:c,r:f})}let s=new Map;for(let e of i){if(!I[e.kind].mesh)continue;let t=G(e.x,e.z),a=s.get(t);a||s.set(t,a=[]),a.push(e)}return{list:l,grid:s}},[e,o]),l=(0,C.s)(H),s=(0,a.useMemo)(()=>{let e=[],t=0;return I.forEach((a,r)=>{if(!a.mesh)return;let i=[];l[t++].scene.traverse(e=>{if(!e.isMesh)return;let t=e.material.clone();(t.alphaTest>0||/leaves/.test(t.name))&&(t.alphaTest=t.alphaTest||.5,t.transparent=!1,t.side=g.Vs,/^elm/.test(t.name)&&t.color.setRGB(.78,.95,.66)),t.onBeforeCompile=e=>(0,y.Z)(e),t.customProgramCacheKey=()=>"tree-lod";let a=new g.YJ((0,b.f)(e),t,U);a.count=0,a.castShadow=!1,a.receiveShadow=!1,a.setColorAt(0,new g.Es(1,1,1)),i.push(a)}),e.push({kind:r,parts:i})}),e},[l]);(0,a.useEffect)(()=>()=>{for(let e of n.list)e.mesh.geometry.dispose()},[n]);let c=(0,a.useRef)(new Set),f=(0,a.useRef)(0),h=(0,a.useMemo)(()=>new g.Es,[]);return(0,m.f)(({camera:e})=>{let t=e.position;for(let e of n.list){let a=Math.max(Math.hypot(t.x-e.cx,t.z-e.cz)-e.r,0);e.mesh.visible=a<P,e.mesh.castShadow=!1}if(f.current++%5)return;let a=new Set;if(t.y<2*B){let e=[],r=Math.ceil(B/64),i=Math.floor(t.x/64),o=Math.floor(t.z/64);for(let a=i-r;a<=i+r;a++)for(let i=o-r;i<=o+r;i++)for(let r of n.grid.get(1e5*a+i)??[]){let a=Math.hypot(r.x-t.x,r.z-t.z);a<B&&e.push({t:r,d:a})}e.sort((e,t)=>e.d-t.d);for(let t=0;t<Math.min(U,e.length);t++)a.add(e[t].t)}let r=new Set,i=(e,t)=>{n.list[e.chunk].mesh.geometry.getAttribute("aTree").setW(e.i,t),r.add(e.chunk)};for(let e of c.current)a.has(e)||i(e,e.s);for(let e of a)c.current.has(e)||i(e,0);for(let e of r)n.list[e].mesh.geometry.getAttribute("aTree").needsUpdate=!0;for(let{kind:e,parts:t}of(c.current=a,s)){let r=0;for(let i of a)if(i.kind===e){for(let e of(k.set(i.x,i.y,i.z),z.setFromAxisAngle(T,i.yaw),R.setScalar(i.s),D.compose(k,z,R),h.setScalar(i.tint),t))e.setMatrixAt(r,D),e.setColorAt(r,h);r++}for(let e of t)e.count=r,e.instanceMatrix.needsUpdate=!0,e.instanceColor&&(e.instanceColor.needsUpdate=!0),r&&e.computeBoundingSphere()}}),(0,t.jsxs)("group",{children:[n.list.map((e,a)=>(0,t.jsx)("primitive",{object:e.mesh},a)),s.flatMap(({parts:e})=>e).map((e,a)=>(0,t.jsx)("primitive",{object:e},`n${a}`))]})}let $=w.u?1800:1/0,V=w.u?600:1/0;function K({plan:e}){let r=(0,a.useMemo)(()=>{let t=(0,x.f)(3),a=[{geo:function(){let e=new g.o1(2.3,2.4,4.6,16,1);e.translate(0,6.3,0);let t=new g.e0(2.5,1.7,16,1);t.translate(0,9.45,0);let a=[e,t];for(let[e,t]of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]]){let r=new g.kG(.22,4,.22);r.translate(e,2,t),a.push(r)}let r=new g.kG(4.4,.25,4.4);return r.translate(0,4,0),a.push(r),(0,v.f)(a.map(e=>e.toNonIndexed()))}(),mat:new g.aV({color:"#6e5a46",roughness:.9}),cast:!0,place:e.waterTowers.map(([e,a,r])=>{let i=6.28*t(),o=.85+.3*t();return()=>{k.set(e,a,r),z.setFromAxisAngle(T,i),R.setScalar(o)}})},{geo:new g.kG(1,1,1),mat:new g.aV({color:"#8d9196",roughness:.45,metalness:.6}),cast:!0,place:e.hvac.map(([e,t,a,r])=>()=>{k.set(e,t+.35*r,a),z.identity(),R.set(1.6*r,.7*r,r)})},{geo:new g.o1(.12,.6,1,6),mat:new g.aV({color:"#b9bcc0",roughness:.35,metalness:.8}),cast:!0,place:e.antennas.map(([e,t,a,r])=>()=>{k.set(e,t+r/2,a),z.identity(),R.set(1,r,1)})}],r=[];for(let e of a){let t=new Map;for(let a of e.place){a();let e=`${Math.floor(k.x/1e3)},${Math.floor(k.z/1e3)}`,r=t.get(e);r||t.set(e,r=[]),r.push(new g.nd().compose(k,z,R))}for(let a of t.values()){let t=new g.YJ(e.geo,e.mat,a.length);a.forEach((e,a)=>t.setMatrixAt(a,e)),t.castShadow=!1,t.receiveShadow=!1,t.matrixAutoUpdate=!1,t.computeBoundingSphere();let i=t.boundingSphere;r.push({mesh:t,c:i.center.clone(),r:i.radius,cast:e.cast})}}return{out:r,kinds:a}},[e]);return(0,a.useEffect)(()=>()=>{for(let e of r.kinds)e.geo.dispose(),e.mat.dispose()},[r]),(0,m.f)(({camera:e})=>{if(!w.u)return;let t=e.position;for(let e of r.out){let a=Math.max(t.distanceTo(e.c)-e.r,0);e.mesh.visible=a<$,e.mesh.castShadow=!1}}),(0,t.jsx)("group",{children:r.out.map((e,a)=>(0,t.jsx)("primitive",{object:e.mesh},a))})}function Z({plan:e}){return(0,t.jsxs)("group",{children:[(0,t.jsx)(K,{plan:e}),(0,t.jsx)(A.H,{children:(0,t.jsx)(q,{plan:e})}),(0,t.jsx)(A.H,{children:(0,t.jsx)(S.U,{plan:e})}),(0,t.jsx)(A.H,{children:(0,t.jsx)(_.f,{})}),(0,t.jsx)(A.H,{children:(0,t.jsx)(L.U,{})}),(0,t.jsx)(E.f,{})]})}var X=e.i(18954),Q=e.i(38376),Y=e.i(66242),J=e.i(8384);let ee={uint8:Uint8Array,uint16:Uint16Array,float32:Float32Array};async function et(){let[e,t]=await Promise.all([fetch("/city/nj.json").then(e=>e.json()),fetch("/city/nj.bin").then(e=>{if(!e.ok)throw Error(`/city/nj.bin: ${e.status}`);return e.arrayBuffer()})]),a=e=>{let a={};for(let r of e)a[r.name]=new ee[r.dtype](t,r.offset,r.length);return a},r=a(e.buildings.arrays),i=a(e.land.arrays),o=a(e.walls.arrays);return{city:{buildings:{count:e.buildings.count,h:r.h,year:r.year,kind:r.kind,style:r.style,seed:r.seed,src:r.src,polys:{count:r.ringCount,len:r.ringLen,xy:r.xy},names:{}}},land:{count:i.landRingCount,len:i.landRingLen,xy:i.landXy},wall:o.wall}}let ea=null,er=()=>ea??=et().catch(()=>null);w.u||(0,Y.c)("city",er);let ei=(e,t)=>e>J.z.x0&&e<J.z.x1&&t>J.z.z0&&t<J.z.z1;function eo(e){e.uniforms.uParisClip=J.Q,e.vertexShader=e.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vParisW;").replace("#include <begin_vertex>","#include <begin_vertex>\nvParisW = (modelMatrix * vec4(transformed, 1.0)).xyz;"),e.fragmentShader=e.fragmentShader.replace("#include <common>","#include <common>\nvarying vec3 vParisW;\nuniform float uParisClip;").replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
if (uParisClip > 0.5 && vParisW.x > ${J.z.x0.toFixed(1)} && vParisW.x < ${J.z.x1.toFixed(1)} && vParisW.z > ${J.z.z0.toFixed(1)} && vParisW.z < ${J.z.z1.toFixed(1)}) discard;`)}function en({material:e}){let r=(0,a.use)(er()),i=(0,a.useMemo)(()=>r?(0,Q.R)(r.city,(e,t,a)=>ei(t,a),1200):[],[r]),o=(0,a.useMemo)(()=>r?(0,Q.R)(r.city,(e,t,a)=>!ei(t,a),1200):[],[r]),n=(0,a.useRef)(null);(0,m.f)(()=>{n.current&&(n.current.visible=J.Q.value<.5)});let l=(0,a.useMemo)(()=>{let e;return r?{geo:function(e){let t=[],a=0,r=0;for(let i=0;i<e.count.length;i++){let o=[];for(let t=0;t<e.count[i];t++,a++){let t=e.len[a],i=[];for(let a=0;a<t;a++,r++)i.push(new g.wq(e.xy[2*r],e.xy[2*r+1]));o.push(i)}let[n,...l]=o,s=g.DE.triangulateShape(n,l),c=[n,...l].flat(),f=new Float32Array(3*c.length);c.forEach((e,t)=>f.set([e.x,0,e.y],3*t));let h=new g.ld;h.setAttribute("position",new g.f5(f,3)),h.setIndex(s.flatMap(([e,t,a])=>[e,a,t])),t.push(h)}let i=(0,v.f)(t);return i.computeVertexNormals(),i}(r.land),mat:((e=new g.aV({color:"#ffffff",roughness:.95})).onBeforeCompile=e=>{(0,y.Z)(e),e.vertexShader=e.vertexShader.replace("#include <common>","#include <common>\nvarying vec2 vLW;").replace("#include <begin_vertex>","#include <begin_vertex>\nvLW = (modelMatrix * vec4(transformed, 1.0)).xz;"),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
varying vec2 vLW;
float lH(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float lN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(lH(i), lH(i + vec2(1, 0)), f.x), mix(lH(i + vec2(0, 1)), lH(i + vec2(1, 1)), f.x), f.y); }`).replace("#include <map_fragment>",`{
  float n = lN(vLW / 60.0) * 0.6 + lN(vLW / 13.0) * 0.4;
  vec3 asphalt = vec3(0.13, 0.13, 0.13);
  vec3 concrete = vec3(0.3, 0.29, 0.27);
  vec3 grass = vec3(0.12, 0.17, 0.08);
  vec3 c = mix(asphalt, concrete, smoothstep(0.35, 0.65, n));
  c = mix(c, grass, smoothstep(0.72, 0.8, lN(vLW / 140.0 + 7.0)) * 0.85);
  diffuseColor.rgb *= c;
}`),eo(e)},e.customProgramCacheKey=()=>"nj-land-3",e)}:null},[r]),s=(0,a.useMemo)(()=>{if(!r)return null;let e=r.wall.length/4,t=(0,X.V)(),a=t.onBeforeCompile;return t.onBeforeCompile=(e,r)=>{a.call(t,e,r),eo(e)},t.customProgramCacheKey=()=>"nj-wall-paris",new g.kE((0,X.E)(r.wall,new Uint8Array(e)),t)},[r]);return r&&l&&s?(0,t.jsxs)("group",{children:[i.map((a,r)=>(0,t.jsx)("mesh",{geometry:a,material:e,receiveShadow:!1},r)),(0,t.jsx)("group",{ref:n,children:o.map((a,r)=>(0,t.jsx)("mesh",{geometry:a,material:e,receiveShadow:!1},r))}),(0,t.jsx)("mesh",{geometry:l.geo,material:l.mat,receiveShadow:!1}),(0,t.jsx)("primitive",{object:s})]}):null}function el(){return(0,a.useMemo)(()=>new Set((new URLSearchParams(window.location.search).get("no")??"").split(",")),[])}e.s(["f",0,el],33372);var es=e.i(75152),ec=e.i(19328),ef=r;let eh=(0,x.f)(0x135289b),eu=e=>e[Math.floor(eh()*e.length)],ed=[],em=[],ep=[];{let{west:e,east:t,depth:a,gap:i}=r.k,o=[[r.v.z0,i[0]],[i[1],r.v.z1]],n=[[134,98],[118,90]],l=[eu(r.L.stone),eu(r.L.brick),eu(r.L.stone),eu(r.L.glass)],s=e=>ed.push({base:0,...e,seed:eh()});o.forEach(([i,o],c)=>{let f=(i+o)/2,h=o-i;for(let[i,o]of[e-a/2,t+a/2].entries()){let e=n[i][c],t=l[2*i+c];s({x:o,z:f,w:a,d:h,y0:0,y1:e,layer:t,roof:r.L.gravel}),s({x:o+(i?6:-6),z:f,w:.6*a,d:.7*h,y0:e,y1:e+14,layer:t,roof:r.L.concrete}),em.push([o+(i?6:-6),e+14,f,12])}});let c=(a,r,i,o,n,l,s)=>ep.push({x:"w"===a?e+.7:t-.7,y:i,z:r,w:o,h:n,yaw:"w"===a?Math.PI/2:-Math.PI/2,kind:l,slot:s});c("w",-770,17,46,18,"skill",0),c("e",-770,16,46,17,"skill",1),c("w",-846,18,52,22,"skill",2),c("e",-846,17,50,20,"skill",3),c("w",-846,40,44,16,"skill",4),c("e",-846,38,42,15,"skill",5),c("w",-770,37,40,14,"skill",6),c("e",-770,35,40,14,"skill",7),c("w",-832,74,22,34,"brand",0),c("e",-856,66,24,30,"poster",0),c("e",-760,58,26,22,"poster",1),c("w",-752,60,24,22,"poster",2),c("e",-828,92,18,22,"brand",1),c("w",-846,5,64,2.6,"ticker",0),c("e",-846,5,64,2.6,"ticker",1),c("w",-756,5,62,2.6,"ticker",2),c("e",-756,5,62,2.6,"ticker",3)}e.s(["r",0,ep,"g",0,em,"t",0,ed],6193);let eg=(e,t)=>(0,ef.e)(e,t)||34>Math.hypot(e-ef.B.x,t-(ef.B.z+44))||ex(e,t),ev=[0,12,24,36,48].map(e=>(0,es.v)(e).clone()),ex=(e,t)=>ev.some(a=>26>Math.hypot(e-a.x,t-a.z));function ey(e,t,a,r,i=140,o=4){let n=[],l=0/0,s=0/0,c=0;for(let f=t;f<=a;f+=o)(r?(0,ec.f)(e,f):(0,ec.f)(f,e))?(Number.isNaN(l)&&(l=f),s=f,c=0):!Number.isNaN(l)&&(c+=o)>10&&(s-l>=i&&n.push([l,s]),l=0/0);return!Number.isNaN(l)&&s-l>=i&&n.push([l,s]),n}(0,Y.c)("city",Q.Y),(0,Y.c)("city",i.E);let ew=new WeakMap,eb=!1;function eM(){let e=(0,Q.G)(),t=ew.get(e);return t||ew.set(e,t=function(e){let t=function(e){let t=(0,x.f)(0x135289c),a={boxes:[...ed],waterTowers:[],hvac:[],antennas:[...em],streetTrees:[],parkTrees:[],lanes:[],hidden:new Set},r=e=>a.boxes.push({base:0,...e,seed:t()});{let e,a=(e=ef.L.stone)[Math.floor(t()*e.length)];r({x:ef.S.x,z:ef.S.z,w:ef.S.w+22,d:56,y0:0,y1:60,layer:a,roof:ef.L.gravel}),r({x:ef.S.x,z:ef.S.z,w:ef.S.w+8,d:52,y0:60,y1:150,layer:a,roof:ef.L.gravel}),r({x:ef.S.x,z:ef.S.z,w:ef.S.w,d:ef.S.d,y0:150,y1:ef.S.h,layer:a,roof:ef.L.gravel})}let i=e.buildings,o=i.polys,n=0,l=0;for(let e=0;e<o.count.length;e++){let s=o.len[l],c=0,f=0,h=1/0,u=-1/0,d=1/0,m=-1/0;for(let e=0;e<s;e++){let t=o.xy[(n+e)*2],a=o.xy[(n+e)*2+1];c+=t,f+=a,h=Math.min(h,t),u=Math.max(u,t),d=Math.min(d,a),m=Math.max(m,a)}for(let t=0;t<o.count[e];t++)n+=o.len[l+t];l+=o.count[e],c/=s,f/=s;let p=i.h[e],g=u-h,v=m-d;if((0,ef.e)(c,f)||g<8||v<8)continue;let x=(h+u)/2,y=(d+m)/2,w=(e,t,a,i,o,n=ef.L.concrete)=>r({x:x,z:y,w:Math.max(4,g*e),d:Math.max(4,v*t),y0:a,y1:i,layer:o,roof:n}),b=i.names[e]??"";if(/^Empire State Building/.test(b)){a.hidden.add(e);let t=ef.L.stone[0];for(let[e,a,r,i]of[[1,1,0,.065],[.6,.82,.065,.68],[.46,.62,.68,.77],[.34,.5,.77,.84],[.22,.34,.84,.9],[.12,.2,.9,1]])w(e,a,r*p,i*p,t,ef.L.gravel);a.antennas.push([x,p,y,62]);continue}if(/^Chrysler Building/.test(b)){a.hidden.add(e);let t=ef.L.brick[2];w(1,1,0,.21*p,t,ef.L.gravel),w(.78,.78,.21*p,.8*p,t,ef.L.gravel);for(let e=0;e<7;e++)w(.62-.075*e,.62-.075*e,.8*p+.028*e*p,.8*p+(e+1)*.028*p,ef.L.glass[0]);a.antennas.push([x,p,y,42]);continue}if(/^Essex House/.test(b))continue;if(/^Tower 1 World Trade/.test(b)&&a.antennas.push([x,p,y,124]),p>90&&g*v>350&&g<140&&v<140){let r=2===i.style[e]||1===i.style[e];i.year[e]>0&&i.year[e]<1950&&r&&p<330?(w(.62,.62,p,p+.05*p,2===i.style[e]?ef.L.stone[1]:ef.L.brick[0],ef.L.gravel),w(.4,.4,p+.05*p,p+.1*p,2===i.style[e]?ef.L.stone[1]:ef.L.brick[0],ef.L.gravel),.5>t()&&a.antennas.push([x,p+.1*p,y,8+14*t()])):(w(.5,.5,p,p+4+6*t(),ef.L.glass[i.seed[e]%4],ef.L.concrete),p>200&&.5>t()&&w(.28,.28,p+8,p+14+10*t(),ef.L.concrete,ef.L.concrete))}let M=g*v>180,S=t();if(p>170)a.antennas.push([c,p,f,10+30*S]),a.hvac.push([c,p,f,3]);else if(M&&p>14){p<120&&S<.3&&a.waterTowers.push([c+(t()-.5)*g*.3,p,f+(t()-.5)*v*.3]);let e=Math.floor(3*t());for(let r=0;r<e;r++)a.hvac.push([c+(t()-.5)*g*.5,p,f+(t()-.5)*v*.5,1.5+2.5*t()])}}for(let e=0;e<ef.u;e++){let r=(0,ef.R)(e);if(r>4200||r<-6500)continue;let i=(0,ef.A)(e)/2;for(let e=-1700;e<1500;e+=9+6*t())for(let o of[-1,1]){if(t()>(w.u?.28:.4))continue;let n=r+o*(i+1.6);2!==(0,ec.T)(e,n)||2!==(0,ec.T)(e,n+.5*o)||eg(e,n)||a.streetTrees.push([e,0,n])}}ef.Q.forEach((e,r)=>{let i=(0,ef.M)(r)/2;for(let r=-6500;r<4200;r+=10+6*t())for(let o of[-1,1]){if(t()>.3)continue;let n=e+o*(i+1.6);2!==(0,ec.T)(n,r)||eg(n,r)||a.streetTrees.push([n,0,r])}});for(let e=-1700;e<3200;e+=7)for(let r=-6500;r<4200;r+=7){let i=e+7*t(),o=r+7*t();!(3!==(0,ec.T)(i,o)||1>Math.hypot((i-ef.N.x)/190,(o-ef.N.z)/150))&&!(1>Math.hypot((i-ef.B.x)/60,(o-ef.B.z)/60))&&t()<(w.u?.3:.62)&&a.parkTrees.push([i,0,o,.7+.8*t()])}ef.Q.forEach((e,t)=>{let r=Math.max(2,Math.floor((0,ef.M)(t)/3.75)-1),i=t%2?1:-1;for(let o=0;o<r;o++){let n=(o-(r-1)/2)*3.75;if((4===t||5===t)&&n>0)continue;let l=e+n;for(let[e,t]of ey(l,-6800,5800,!0)){let r=t-e;a.lanes.push({ax:l,az:i>0?e:t,bx:l,bz:i>0?t:e,n:Math.max(1,Math.round(r/105))})}}});for(let e=2;e<ef.u-1;e+=3){let t=(0,ef.R)(e);if(t>-1800&&t<-300||t>3300)continue;let r=e%2?1:-1,i=t+2.4*r;for(let[e,t]of ey(i,-1700,1500,!1,160)){let o=t-e;a.lanes.push({ax:r>0?e:t,az:i,bx:r>0?t:e,bz:i,n:Math.max(1,Math.round(o/95))})}}return a}(e);if(!eb){for(let e of(eb=!0,t.boxes))r.K.add({x0:e.x-e.w/2,x1:e.x+e.w/2,z0:e.z-e.d/2,z1:e.z+e.d/2,y0:e.y0,y1:e.y1});let a=e.buildings;(0,Q.$)(a.polys,(e,i,o,n)=>{if(t.hidden.has(e))return;let l=1/0,s=-1/0,c=1/0,f=-1/0;for(let e=0;e<a.polys.len[n];e++){let t=a.polys.xy[(i+e)*2],r=a.polys.xy[(i+e)*2+1];l=Math.min(l,t),s=Math.max(s,t),c=Math.min(c,r),f=Math.max(f,r)}l<s&&!(0,r.e)((l+s)/2,(c+f)/2)&&r.K.add({x0:l,x1:s,z0:c,z1:f,y0:0,y1:Math.max(a.h[e],3)})})}let a=(0,d.t)(e,(e,a,i)=>(0,r.e)(a,i)||t.hidden.has(e));return{city:e,plan:t,rows:a,skip:(i,o,n,l)=>!!((0,r.e)(o,n)||t.hidden.has(i)||a.swapped.has(i))||!!w.u&&!(o>-1e3&&o<1e3&&n>-2700&&n<300)&&l<(e.buildings.src[i]?70:38)}}(e)),t}e.s(["X",0,function(){let e=el(),{city:a,plan:r,rows:i,skip:o}=eM();return(0,t.jsxs)("group",{children:[!e.has("dressing")&&(0,t.jsx)(A.H,{children:(0,t.jsx)(h.U,{city:a,skip:o})}),!e.has("brownstones")&&(0,t.jsx)(A.H,{children:(0,t.jsx)(u.f,{swaps:i.swaps})}),!e.has("props")&&(0,t.jsx)(A.H,{children:(0,t.jsx)(Z,{plan:r})})]})},"U",0,function(){let{color:e,normal:r}=(0,i.O)(),{city:h,plan:u,skip:d}=eM(),m=(0,a.useMemo)(()=>(0,o.f)(e,r,(0,n.e)()),[e,r]);return(0,t.jsxs)("group",{children:[(0,t.jsx)(s.f,{city:h,material:m,skip:d}),(0,t.jsx)(f.f,{city:h,skip:d}),(0,t.jsx)(l.f,{boxes:u.boxes,material:m}),(0,t.jsx)(c.f,{city:h,color:e,normal:r}),!w.u&&(0,t.jsx)(A.H,{children:(0,t.jsx)(en,{material:m})})]})}],15577)},38316,89861,18954,92827,96377,652,16328,54102,88699,68818,e=>{var t=e.i(43476),a=e.i(71645),r=e.i(98903),i=e.i(90072),o=e.i(54008),n=e.i(99372),l=e.i(84670),s=e.i(27225),c=e.i(8175),f=e.i(55851),h=e.i(78785),u=e.i(38408),d=e.i(17829),m=e.i(78176),p=e.i(15102);let g=h.u?150:260,v=h.u?192:384,x=Math.pow(7e4,1/g),y=Math.max(x-1,2*Math.PI/v);class w{camera=new i.zm;target;texMatrix=new i.nd;plane=new i._m;clip=new i.$i;q=new i.$i;view=new i.cE;look=new i.cE;tgt=new i.cE;rot=new i.nd;camPos=new i.cE;size=new i.wq;constructor(){this.target=new i.qL(4,4,{type:i.HN,generateMipmaps:!0,minFilter:i.Q4,magFilter:i.VV})}render(e,t,a,r){let o=e.getDrawingBufferSize(this.size),n=Math.max(4,Math.round(o.x*r*1.15)),l=Math.max(4,Math.round(o.y*r*1.15));(this.target.width!==n||this.target.height!==l)&&this.target.setSize(n,l);let s=new i.cE(0,1,0),c=new i.cE(0,p.B,0);this.camPos.setFromMatrixPosition(a.matrixWorld),this.view.copy(this.camPos),this.view.y=2*p.B-this.view.y,this.rot.extractRotation(a.matrixWorld),this.look.set(0,0,-1).applyMatrix4(this.rot).add(this.camPos),this.tgt.copy(this.look),this.tgt.y=2*p.B-this.tgt.y;let f=this.camera;f.position.copy(this.view),f.up.set(0,1,0).applyMatrix4(this.rot).reflect(s),f.lookAt(this.tgt),f.near=a.near,f.far=a.far,f.updateMatrixWorld(),f.projectionMatrix.copy(a.projectionMatrix),f.projectionMatrix.elements[0]/=1.15,f.projectionMatrix.elements[5]/=1.15,this.texMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),this.texMatrix.multiply(f.projectionMatrix).multiply(f.matrixWorldInverse),this.plane.setFromNormalAndCoplanarPoint(s,c).applyMatrix4(f.matrixWorldInverse),this.clip.set(this.plane.normal.x,this.plane.normal.y,this.plane.normal.z,this.plane.constant);let h=f.projectionMatrix.elements;this.q.set((Math.sign(this.clip.x)+h[8])/h[0],(Math.sign(this.clip.y)+h[9])/h[5],-1,(1+h[10])/h[14]),this.clip.multiplyScalar(2/this.clip.dot(this.q)),h[2]=this.clip.x,h[6]=this.clip.y,h[10]=this.clip.z+1-.003,h[14]=this.clip.w,f.projectionMatrixInverse.copy(f.projectionMatrix).invert();let u=e.getRenderTarget(),d=e.shadowMap.autoUpdate;e.shadowMap.autoUpdate=!1,e.setRenderTarget(this.target),e.state.buffers.depth.setMask(!0),e.clear(),e.render(t,f),e.shadowMap.autoUpdate=d,e.setRenderTarget(u)}dispose(){this.target.dispose()}}let b=`
uniform float uTime;
uniform float uGridK;
varying vec2 vWaterXZ;
varying float vWaterH;
${p.J}
`,M=`
uniform float uTime;
uniform sampler2D uDetail;
uniform sampler2D uMirror;
uniform mat4 uMirrorMatrix;
uniform float uMirrorOn;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
varying vec2 vWaterXZ;
varying float vWaterH;
${p.J}
vec3 wDetail(vec2 uv) {
  vec4 t = texture2D(uDetail, uv);
  return vec3(t.r * 2.0 - 1.0, t.b * 2.0 - 1.0, t.g * 2.0 - 1.0);
}
`;function S(){let{gl:e,scene:o,camera:l}=(0,u.f)(),f=(0,s.f)(e=>e.quality),S=(0,a.useMemo)(()=>{let e=new i.H5().load("/textures/water/detail.png");return e.wrapS=e.wrapT=i.FP,e.colorSpace=i.Ik,e.anisotropy=8,e},[]),_=(0,a.useMemo)(()=>new w,[]);(0,a.useEffect)(()=>()=>_.dispose(),[_]);let L=(0,a.useMemo)(()=>{let e,t,a;return e=new i.Ox({color:new i.Es(.016,.036,.034),roughness:.035,metalness:0,ior:1.333,specularIntensity:1}),t={uTime:c.f.uTime,uGridK:{value:y},uDetail:{value:S},uMirror:{value:_.target.texture},uMirrorMatrix:{value:_.texMatrix},uMirrorOn:{value:0},uSunDir:{value:new i.cE(0,1,0)},uSunCol:{value:new i.Es(1,1,1)},...(0,p.E)()},e.userData.water=t,e.onBeforeCompile=e=>{(0,n.Z)(e),Object.assign(e.uniforms,t),e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
${b}`).replace("#include <beginnormal_vertex>",`
        vec3 wWorld0 = (modelMatrix * vec4(position, 1.0)).xyz;
        float wFoot = length(position.xz) * uGridK + 0.08;
        vec3 wDisp; vec3 wN; float wJ; float wLost;
        gerstner(wWorld0.xz, uTime, wFoot, wDisp, wN, wJ, wLost);
        vec3 objectNormal = wN;
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3(tangent.xyz);
        #endif
        vWaterXZ = wWorld0.xz;
        vWaterH = wDisp.y;`).replace("#include <begin_vertex>","#include <begin_vertex>\ntransformed += wDisp;"),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
${M}`).replace("#include <normal_fragment_maps>",`
        #include <normal_fragment_maps>
        // per-pixel waves: the ones a pixel can't hold become roughness instead of noise
        vec2 wp = vWaterXZ;
        float wPix = length(fwidth(wp));
        vec3 gD; vec3 gN; float gJ; float gLost;
        gerstner(wp, uTime, wPix * 1.5, gD, gN, gJ, gLost);
        float wDist = length(cameraPosition.xz - wp);
        // FFT chop at two scales, drifting with the wind; it calms with distance (the mips average it)
        vec3 d1 = wDetail(wp / 17.0 + uTime * vec2(0.018, -0.011));
        vec3 d2 = wDetail(mat2(0.8, 0.6, -0.6, 0.8) * wp / 5.7 + uTime * vec2(-0.026, 0.041));
        float near = 1.0 - smoothstep(60.0, 900.0, wDist);
        vec2 slope = gN.xz / gN.y + (d1.xz / max(d1.y, 0.3)) * 0.22 + (d2.xz / max(d2.y, 0.3)) * 0.11 * near;
        vec3 wNrm = normalize(vec3(slope.x, 1.0, slope.y));
        normal = normalize((viewMatrix * vec4(wNrm, 0.0)).xyz);
        // folded-away slope variance (Toksvig) and the distance a pixel spans
        float rough2 = 0.035 * 0.035 + gLost * 0.5 + (1.0 - length(d1)) * 0.06 + 0.0004 * smoothstep(200.0, 4000.0, wDist);
        roughnessFactor = sqrt(rough2);
        // whitecaps where the waves fold, laced by the foam pattern
        float wFoam = smoothstep(0.62, 0.2, gJ) * texture2D(uDetail, wp / 6.5 + uTime * vec2(0.01, -0.006)).a;
        wFoam *= 1.0 - smoothstep(150.0, 600.0, wDist);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.78, 0.8, 0.78), wFoam);
        roughnessFactor = mix(roughnessFactor, 0.7, wFoam);`).replace("#include <emissivemap_fragment>",`
        #include <emissivemap_fragment>
        {
          // sunlight through the backs of the crests, toward the sun
          vec3 V = normalize(cameraPosition - vec3(vWaterXZ.x, ${p.B.toFixed(1)}, vWaterXZ.y));
          float fwd = pow(clamp(dot(-V, uSunDir), 0.0, 1.0), 4.0);
          float crest = clamp(vWaterH * 2.2 + 0.25, 0.0, 1.0);
          totalEmissiveRadiance += uSunCol * vec3(0.05, 0.16, 0.12) * fwd * crest * 0.35 * (1.0 - 0.6 * uSunDir.y);
        }`).replace("#include <lights_fragment_maps>",`
        #include <lights_fragment_maps>
        #if defined( RE_IndirectSpecular )
        if (uMirrorOn > 0.0) {
          // the mirrored city, rippled: look-ups bend with the waves, more where they're close
          vec4 rc = uMirrorMatrix * vec4(vWaterXZ.x, ${p.B.toFixed(1)}, vWaterXZ.y, 1.0);
          vec2 ruv = rc.xy / rc.w;
          vec3 upV = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
          ruv += (normal.xy - upV.xy) * 0.09 / (1.0 + wDist * 0.004);
          float lod = clamp(log2(1.0 + roughnessFactor * 40.0), 0.0, 4.0);
          vec3 mirrored = textureLod(uMirror, clamp(ruv, 0.001, 0.999), lod).rgb;
          // fades back to the sky's reflection where the mirror has nothing (off its edges)
          float edge = smoothstep(0.0, 0.03, ruv.x) * smoothstep(1.0, 0.97, ruv.x) * smoothstep(0.0, 0.03, ruv.y) * smoothstep(1.0, 0.97, ruv.y);
          radiance = mix(radiance, mirrored, uMirrorOn * edge);
        }
        #endif`).replace("#include <opaque_fragment>",`
        #include <opaque_fragment>
        #ifdef WATER_DBG
          #if WATER_DBG == 1
            gl_FragColor = vec4(radiance, 1.0);
          #elif WATER_DBG == 2
            gl_FragColor = vec4(textureLod(uMirror, gl_FragCoord.xy / vec2(textureSize(uMirror, 0)) * 0.5, 0.0).rgb, 1.0);
          #elif WATER_DBG == 3
            gl_FragColor = vec4(wNrm * 0.5 + 0.5, 1.0);
          #elif WATER_DBG == 4
            gl_FragColor = vec4(reflectedLight.indirectSpecular, 1.0);
          #elif WATER_DBG == 5
            gl_FragColor = vec4(vec3(dot(normal, geometryViewDir)), 1.0);
          #elif WATER_DBG == 6
            gl_FragColor = vec4(material.specularColor * 30.0, material.specularF90);
          #elif WATER_DBG == 8
            gl_FragColor = vec4(vec3(material.roughness), 1.0);
          #elif WATER_DBG == 9
            gl_FragColor = vec4(vec3(DFGApprox(normal, geometryViewDir, material.roughness), 0.0), 1.0);
          #elif WATER_DBG == 7
            gl_FragColor = vec4(reflectedLight.indirectDiffuse + reflectedLight.directDiffuse, 1.0);
          #endif
        #endif`)},(a=Number(new URLSearchParams(window.location.search).get("waterdbg")??0))&&(e.defines={...e.defines,WATER_DBG:a}),e.customProgramCacheKey=()=>`ocean-1-${a}`,e},[S,_]),E=(0,a.useMemo)(()=>{let e=new i.kE(function(){let e=1+g*v,t=new Float32Array(3*e);for(let e=0;e<g;e++){let a=.6*Math.pow(x,e+1);for(let r=0;r<v;r++){let i=r/v*Math.PI*2,o=1+e*v+r;t[3*o]=Math.cos(i)*a,t[3*o+2]=Math.sin(i)*a}}let a=[];for(let e=0;e<v;e++)a.push(0,1+(e+1)%v,1+e);for(let e=0;e<g-1;e++)for(let t=0;t<v;t++){let r=1+e*v+t,i=1+e*v+(t+1)%v,o=r+v,n=i+v;a.push(r,i,o,i,n,o)}let r=new i.ld;r.setAttribute("position",new i.f5(t,3));let o=new Float32Array(3*e);for(let t=0;t<e;t++)o[3*t+1]=1;return r.setAttribute("normal",new i.f5(o,3)),r.setIndex(e>65535?new i.$3(a,1):new i._1(a,1)),r}(),L);return e.frustumCulled=!1,e.receiveShadow=!0,e.renderOrder=-1,e},[L]),A=(0,a.useMemo)(()=>new URLSearchParams(window.location.search).has("nomirror"),[]);return(0,r.f)(()=>{E.position.set(l.position.x,p.B,l.position.z),E.visible=s.$.p<=.9;let t=L.userData.water;t.uSunDir.value.copy(d._.sunDir),(0,m.i)(d._.sunDir,10,t.uSunCol.value).multiplyScalar(i.rB.smoothstep(d._.elev,-1,3));let a=!A&&!h.u&&"low"!==f&&E.visible&&l.position.y<450?1:0;t.uMirrorOn.value=a,a&&(E.visible=!1,_.render(e,o,l,"high"===f?.5:.35),E.visible=!0)},.5),(0,t.jsx)("primitive",{object:E})}e.s(["k",0,y,"U",0,S],89861);let _=p.B-5;function L(e,t){let a=t.length,r=new Float32Array(4*a*3),o=new Float32Array(4*a*3),n=new Float32Array(4*a),l=new Uint8Array(4*a),s=new Uint32Array(6*a),c=0;for(let i=0;i<a;i++){let a=e[4*i],f=e[4*i+1],h=e[4*i+2],u=e[4*i+3],d=Math.hypot(h-a,u-f),m=(u-f)/d,p=-(h-a)/d,g=4*i;r.set([a,.02,f,h,.02,u,h,_,u,a,_,f],3*g);for(let e=0;e<4;e++)o.set([m,0,p],(g+e)*3);n.set([c,c+d,c+d,c],g),l.fill(t[i],g,g+4),s.set([g,g+1,g+2,g,g+2,g+3],6*i),c+=d}let f=new i.ld;return f.setAttribute("position",new i.f5(r,3)),f.setAttribute("normal",new i.f5(o,3)),f.setAttribute("aAlong",new i.f5(n,1)),f.setAttribute("aKind",new i.f5(l,1)),f.setIndex(new i.f5(s,1)),f.computeBoundingSphere(),f}let E=`
varying vec3 vWW;
varying float vAlong;
flat varying float vWallKind;
float wH(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float wN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(wH(i), wH(i + vec2(1, 0)), f.x), mix(wH(i + vec2(0, 1)), wH(i + vec2(1, 1)), f.x), f.y); }
`,A=`
{
  float y = vWW.y;
  float u = vAlong;
  vec2 st = vec2(u, y);
  float grime = wN(st * vec2(0.08, 0.5)) * 0.6 + wN(st * vec2(0.6, 1.4)) * 0.4;
  vec3 alb;
  float rough = 0.85;
  if (vWallKind < 0.5) {
    // coursed granite: 0.75 m courses, blocks 1.2-2.4 m, each its own grey
    float course = floor(y / 0.75);
    float off = wH(vec2(course, 3.0)) * 2.0;
    float bw = 1.2 + wH(vec2(course, 7.0)) * 1.2;
    float block = floor((u + off) / bw);
    float tone = wH(vec2(block, course));
    alb = mix(vec3(0.36, 0.34, 0.31), vec3(0.47, 0.45, 0.41), tone);
    vec2 jf = vec2(fract((u + off) / bw) * bw, fract(y / 0.75) * 0.75);
    float joint = 1.0 - step(0.035, min(min(jf.x, bw - jf.x), min(jf.y, 0.75 - jf.y)));
    alb *= 1.0 - 0.45 * joint;
    // runoff streaks from the top, rust from the railing posts
    float streak = wN(vec2(u * 1.7, y * 0.12)) * smoothstep(-2.6, 0.0, y);
    alb *= 1.0 - 0.25 * streak;
    alb = mix(alb, vec3(0.32, 0.2, 0.12), smoothstep(0.82, 0.95, wN(vec2(u * 0.35, 1.0))) * 0.35 * smoothstep(-1.5, 0.0, y));
  } else {
    // the pier: a weathered concrete deck edge and its timber fender over the dark void between
    // the pilings
    float edge = smoothstep(-1.15, -1.1, y);
    vec3 deck = mix(vec3(0.27, 0.265, 0.25), vec3(0.36, 0.35, 0.33), grime);
    // drip stains, and rust bleeding down from the rail posts
    deck *= 1.0 - 0.35 * smoothstep(0.45, 0.8, wN(vec2(u * 1.1, y * 0.6))) * smoothstep(-1.1, 0.0, y);
    deck = mix(deck, vec3(0.3, 0.17, 0.09), smoothstep(0.8, 0.95, wN(vec2(u * 0.5, 2.0))) * 0.5);
    float seam = 1.0 - smoothstep(0.0, 0.05, abs(fract(u / 6.0) - 0.5) * 6.0 - 2.94);
    deck *= 1.0 - 0.4 * seam;
    // the timber fender: dark, worn whalers
    float fender = step(-0.8, y) * step(y, -0.3);
    deck = mix(deck, vec3(0.11, 0.085, 0.06) * (0.7 + 0.5 * wN(vec2(u * 2.0, y * 9.0))), fender);
    float pile = abs(fract(u / 3.0) - 0.5) * 3.0;
    float isPile = 1.0 - smoothstep(0.2, 0.26, pile);
    // the piles are round: lit down their middles, darker into the shade under the deck
    float round = sqrt(max(0.0, 1.0 - pow(pile / 0.23, 2.0)));
    vec3 wood = vec3(0.1, 0.085, 0.07) * (0.55 + 0.6 * wN(vec2(u * 3.0, y * 2.0))) * (0.35 + 0.65 * round);
    vec3 under = mix(vec3(0.004, 0.0045, 0.0045), wood * (0.3 + 0.7 * smoothstep(-1.4, -3.0, y)), isPile);
    alb = mix(under, deck, edge);
    rough = mix(0.97, 0.88, edge);
    // the void sees almost no sky: shut its ambient light out (see the lights patch)
    wShade = mix(mix(0.08, 0.5, isPile * smoothstep(-1.3, -2.8, y)), 1.0, edge);
  }
  // splash zone: darker and wetter toward the waterline, then a band of weed at the tideline
  float wet = smoothstep(-1.6, -2.7, y);
  alb *= 1.0 - 0.45 * wet;
  rough = mix(rough, 0.35, wet * 0.7);
  float weed = smoothstep(-2.45, -2.75, y) * (0.6 + 0.4 * wN(st * vec2(0.9, 3.0)));
  alb = mix(alb, vec3(0.05, 0.07, 0.035), weed);
  alb *= 0.85 + 0.3 * grime;
  diffuseColor.rgb *= alb;
  wRough = rough;
}
`;function C(){let e=new i.aV({roughness:.85,metalness:0});return e.onBeforeCompile=e=>{(0,n.Z)(e),e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
attribute float aAlong;
attribute float aKind;
${E}`).replace("#include <begin_vertex>","#include <begin_vertex>\nvWW = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvAlong = aAlong;\nvWallKind = aKind;"),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
${E}
float wRough;
float wShade = 1.0;`).replace("#include <map_fragment>",A).replace("#include <roughnessmap_fragment>","#include <roughnessmap_fragment>\nroughnessFactor = wRough;").replace("#include <lights_fragment_end>","#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= wShade;\nreflectedLight.indirectSpecular *= wShade;")},e.customProgramCacheKey=()=>"waterfront-2",e}function D({city:e}){let r=(0,a.useMemo)(()=>{let t=e.waterfront;if(!t)return null;let a=new i.kE(L(t.wall,t.kind),C());return a.receiveShadow=!0,a},[e]);return r?(0,t.jsx)("primitive",{object:r}):null}e.s(["U",0,D,"E",0,L,"V",0,C],18954);let z=`
uniform sampler2DArray uFacade;
uniform sampler2DArray uFacadeN;
uniform float uNight;
uniform vec2 uScan;
varying vec3 vGW;
vec3 gN;
float gRough;
vec3 gEmit;
float gH(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float gNoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(gH(i), gH(i + vec2(1, 0)), f.x), mix(gH(i + vec2(0, 1)), gH(i + vec2(1, 1)), f.x), f.y); }
vec4 gTex(float layer, vec2 uv, out vec3 nrm, out float rough) {
  vec4 c = texture(uFacade, vec3(uv, layer));
  vec3 nr = texture(uFacadeN, vec3(uv, layer)).rgb;
  vec2 nxy = nr.rg * 2.0 - 1.0;
  nrm = normalize(vec3(nxy.x, sqrt(max(1.0 - dot(nxy, nxy), 0.0)), -nxy.y));
  rough = nr.b;
  return c;
}
`,k=l.Q,R=`float[${k.length}](${k.map(e=>e.toFixed(1)).join(",")})`,T=`
{
  float x = vGW.x;
  float z = vGW.z;
  vec3 alb;
  vec3 nrm = vec3(0.0, 1.0, 0.0);
  float rough = 0.9;
  float dAve = 1e5;
  float aveX = 0.0;
  float aves[${k.length}] = ${R};
  for (int i = 0; i < ${k.length}; i++) { float d = abs(x - aves[i]); if (d < dAve) { dAve = d; aveX = aves[i]; } }
  bool road = vKind < 0.5;
  bool walk = vKind > 0.5 && vKind < 1.5;
  bool plaza = x > ${l.v.x0.toFixed(1)} && x < ${l.v.x1.toFixed(1)} && z > ${l.v.z0.toFixed(1)} && z < ${l.v.z1.toFixed(1)} && abs(x - ${l.v.x.toFixed(1)}) > 9.0;
  float macro = gNoise(vGW.xz * 0.004) * 0.6 + gNoise(vGW.xz * 0.03) * 0.4;
  if (plaza) {
    alb = gTex(20.0, vGW.xz / 5.0, nrm, rough).rgb * vec3(0.5, 0.49, 0.48);
    vec2 pv = abs(fract(vGW.xz / vec2(2.4, 1.2)) - 0.5);
    alb *= 1.0 - 0.22 * step(0.475, max(pv.x, pv.y));
    alb *= 0.92 + 0.16 * gH(floor(vGW.xz / vec2(2.4, 1.2)));
    if (x > -300.0 && x < -276.0 && z > -760.0 && z < -738.0) { alb = vec3(0.55, 0.06, 0.06); rough = 0.35; }
  } else if (road) {
    alb = gTex(16.0, vGW.xz / 8.0, nrm, rough).rgb;
    alb *= 0.8 + 0.35 * macro;
    vec3 fnrm; float frough;
    vec3 fine = gTex(16.0, vGW.xz / 1.7 + 0.37, fnrm, frough).rgb;
    nrm = normalize(vec3(nrm.x + fnrm.x * 0.9, nrm.y, nrm.z + fnrm.z * 0.9));
    alb *= 0.75 + 0.9 * dot(fine, vec3(0.333));
    vec2 pc = floor(vGW.xz / vec2(6.0, 3.5));
    if (gH(pc + 17.0) < 0.07) {
      vec2 pf = abs(fract(vGW.xz / vec2(6.0, 3.5)) - 0.5);
      alb *= 0.82 * (1.0 - 0.25 * step(0.46, max(pf.x, pf.y)));
    }
    float crack = abs(gNoise(vGW.xz * 0.21) - 0.5) + abs(gNoise(vGW.zx * 0.13 + 7.0) - 0.5) * 0.5;
    alb *= 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.012, crack));
    // wheel tracks, oil and lane paint on the avenues (their centrelines are real; the lanes are approximate)
    bool onAve = dAve < 9.5;
    if (onAve) {
      float ln = abs(fract((x - aveX) / 3.75 + 0.5) - 0.5) * 3.75;
      float mid = 1.875 - ln;
      float track = exp(-pow((abs(mid) - 0.85) / 0.24, 2.0));
      float oil = smoothstep(0.74, 0.9, gNoise(vGW.xz * vec2(1.6, 0.45) + 3.0)) * exp(-pow(mid / 0.32, 2.0));
      alb *= 1.0 - 0.16 * track - 0.4 * oil;
      rough = mix(rough, 0.28, clamp(track * 0.35 + oil, 0.0, 1.0));
    }
    vec2 mc = floor(vGW.xz / 11.0);
    vec2 mo = vec2(gH(mc + 3.1), gH(mc + 5.7)) * 7.0 + 2.0;
    float md = length(vGW.xz - (mc * 11.0 + mo));
    if (gH(mc) < 0.22 && md < 0.36) {
      float ring = step(0.3, md);
      float grid = step(0.5, fract((vGW.x + vGW.z) * 9.0)) * 0.25;
      alb = vec3(0.05, 0.048, 0.045) * (1.0 + grid) * (ring > 0.5 ? 0.7 : 1.0);
      rough = 0.45;
      nrm = vec3(0.0, 1.0, 0.0);
    }
    float paint = 0.0;
    if (onAve) {
      float lane = abs(fract((x - aveX) / 3.75 + 0.5) - 0.5) * 3.75;
      paint = step(lane, 0.08) * step(0.62, fract(z / 9.0)) * step(1.0, dAve);
    }
    paint *= smoothstep(0.2, 0.55, gNoise(vGW.xz * 7.0) * 0.7 + gNoise(vGW.xz * 29.0) * 0.3 + 0.12);
    alb = mix(alb, vec3(0.78), paint * 0.9);
    rough = mix(rough, 0.6, paint);
  } else if (walk) {
    alb = gTex(20.0, vGW.xz / 6.0, nrm, rough).rgb * 0.62;
    vec2 slab = abs(fract(vGW.xz / 1.6) - 0.5);
    alb *= 1.0 - 0.18 * step(0.47, max(slab.x, slab.y));
    alb *= 0.9 + 0.2 * macro;
  } else {
    alb = gTex(18.0, vGW.xz / 7.0, nrm, rough).rgb;
    alb *= mix(vec3(0.85, 0.95, 0.8), vec3(1.1, 1.05, 0.9), macro);
    // a lawn scatters light, it doesn't mirror it (the screen's glow made a wet sheen of it)
    rough = max(rough, 0.9);
  }
  diffuseColor.rgb *= alb;
  gN = nrm;
  gRough = rough;
  gEmit = vec3(0.0);
  if (uScan.y > 0.001) {
    float isle = step(x, 1700.0) * step(-1500.0, x);
    float done = step(uScan.x, x) * uScan.y * isle;
    float front = exp(-abs(x - uScan.x) / 3.0) * uScan.y * isle;
    float fx = abs(fract(x / 10.0 + 0.5) - 0.5) * 10.0;
    float fz = abs(fract(z / 10.0 + 0.5) - 0.5) * 10.0;
    float w = max(fwidth(x), fwidth(z)) * 1.5 + 1e-4;
    float gl = 1.0 - smoothstep(w * 0.5, w, min(fx, fz));
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.06, done);
    gEmit = mix(gEmit, vec3(0.0), done) + done * gl * (road ? 1.0 : 0.5) * vec3(0.2, 0.9, 1.3) * 0.8 + front * vec3(1.6, 2.4, 3.0) * 1.5;
  }
}
`;function N(e,t,a,r,i,n){let l=0,s=0;for(let c=0;c<e.count.length;c++){let f=[],h=[],u=[];for(let t=0;t<e.count[c];t++){let a=e.len[l+t];t>0&&h.push(f.length/2),u.push([s,a]);for(let t=0;t<a;t++)f.push(e.xy[(s+t)*2],e.xy[(s+t)*2+1]);s+=a}l+=e.count[c];let d=(0,o.f)(f,h,2);for(let e=0;e<d.length;e+=3){let o=d[e],n=d[e+1],l=d[e+2];for(let e of(f[2*n+1]-f[2*o+1])*(f[2*l]-f[2*o])-(f[2*n]-f[2*o])*(f[2*l+1]-f[2*o+1])>0?[o,n,l]:[o,l,n])r.push(f[2*e],t,f[2*e+1]),i.push(a)}if(n)for(let a=0;a<u.length;a++){let[r,i]=u[a],o=0;for(let t=0;t<i;t++){let a=(t+1)%i;o+=e.xy[(r+t)*2]*e.xy[(r+a)*2+1]-e.xy[(r+a)*2]*e.xy[(r+t)*2+1]}let l=0===a?o>0:o<0;for(let a=0;a<i;a++){let o=r+(l?(i-a)%i:a),s=r+(l?(i-(a+1)%i)%i:(a+1)%i),c=e.xy[2*o],f=e.xy[2*o+1],h=e.xy[2*s],u=e.xy[2*s+1],d=Math.hypot(h-c,u-f);d<.05||n.push(c,0,f,h,0,u,h,t,u,c,0,f,h,t,u,c,t,f,-(u-f)/d,(h-c)/d)}}}}e.s(["f",0,function({city:e,color:o,normal:u}){let d=(0,a.useMemo)(()=>{let e;return(e=new i.aV({roughness:1,metalness:0})).onBeforeCompile=e=>{(0,n.Z)(e),e.uniforms.uFacade={value:o},e.uniforms.uFacadeN={value:u},e.uniforms.uNight=c.f.uNight,e.uniforms.uScan=c.f.uScan,e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
attribute float aKind;
varying vec3 vGW;
flat varying float vKind;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vGW = (modelMatrix * vec4(transformed, 1.0)).xyz;
vKind = aKind;`),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
flat varying float vKind;
${z}`).replace("#include <map_fragment>",T).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
roughnessFactor = gRough;`).replace("#include <normal_fragment_maps>","normal = normalize((viewMatrix * vec4(gN, 0.0)).xyz);").replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance += gEmit;").replace("#include <lights_fragment_end>","#include <lights_fragment_end>\nif (vKind > 1.5) { reflectedLight.directSpecular *= 0.25; reflectedLight.indirectSpecular *= 0.3; }")},e.customProgramCacheKey=()=>"real-ground-v2",e},[o,u]),m=(0,a.useMemo)(()=>(function(e){let t=[],a=[],r=[];N(e.ground.land,0,0,t,a,null),N(e.ground.paved,l.C,1,t,a,r),N(e.ground.park,l.C,2,t,a,r);let{x0:o,x1:n,z0:s,z1:c}=l.v;for(let[e,r]of[[o,c],[n,c],[n,s],[o,c],[n,s],[o,s]])t.push(e,l.C+.01,r),a.push(1);let f=t.length/3,u=r.length/20,d=new Float32Array(3*f+18*u),m=new Int8Array(d.length),p=new Uint8Array(d.length/3);d.set(t);for(let e=0;e<f;e++)m[3*e+1]=127;p.set(a);for(let e=0;e<u;e++){let t=20*e;for(let a=0;a<6;a++){let i=3*f+(6*e+a)*3;d[i]=r[t+3*a],d[i+1]=r[t+3*a+1],d[i+2]=r[t+3*a+2],m[i]=Math.round(127*r[t+18]),m[i+2]=Math.round(127*r[t+19])}}let g=new i.ld;return g.setAttribute("position",new i.f5(d,3)),g.setAttribute("normal",new i.f5(m,3,!0)),g.setAttribute("aKind",new i.f5(p,1)),g.addGroup(0,f,0),g.addGroup(f,6*u,1),g.computeBoundingSphere(),(0,h.m)(g),g})(e),[e]),p=(0,a.useMemo)(()=>new i.Ox({color:"#1b3540",roughness:.05,metalness:0,normalMap:"u"<typeof document?null:function(){let e=new Float32Array(65536),t=(0,f.f)(17);for(let a=0;a<4;a++){let r=2**(a+1),i=10*t();for(let t=0;t<256;t++)for(let o=0;o<256;o++)e[256*t+o]+=(Math.sin((o+.3*t)/256*Math.PI*2*r+i)+Math.sin((t-.6*o)/256*Math.PI*2*r*1.3+2*i))/(a+1)}let a=document.createElement("canvas");a.width=a.height=256;let r=a.getContext("2d"),o=r.createImageData(256,256);for(let t=0;t<256;t++)for(let a=0;a<256;a++){let r=e[256*t+(a+1)%256]-e[256*t+(a-1+256)%256],n=e[(t+1)%256*256+a]-e[(t-1+256)%256*256+a],l=new i.cE(-(.7*r),-(.7*n),1).normalize(),s=(256*t+a)*4;o.data[s]=(.5*l.x+.5)*255,o.data[s+1]=(.5*l.y+.5)*255,o.data[s+2]=(.5*l.z+.5)*255,o.data[s+3]=255}r.putImageData(o,0,0);let n=new i.Nk(a);return n.wrapS=n.wrapT=i.FP,n.repeat.set(900,900),n}(),normalScale:new i.wq(.35,.35),clearcoat:.4,clearcoatRoughness:.1}),[]),g=(0,a.useMemo)(()=>new i.aV({color:"#8d8a84",roughness:.82}),[]),v=(0,a.useRef)(null);return(0,r.f)(()=>{let e=c.f.uTime.value;p.normalMap&&p.normalMap.offset.set(9e-4*e,5e-4*e),v.current&&(v.current.visible=s.$.p>.9)}),(0,t.jsxs)("group",{children:[(0,t.jsx)("mesh",{geometry:m,material:[d,g],receiveShadow:!1}),(0,t.jsx)(S,{}),(0,t.jsx)(D,{city:e}),(0,t.jsx)("mesh",{ref:v,"rotation-x":-Math.PI/2,position:[(l.J.x0+l.J.x1)/2,-3,(l.J.z0+l.J.z1)/2],material:p,visible:!1,children:(0,t.jsx)("planeGeometry",{args:[l.J.x1-l.J.x0,l.J.z1-l.J.z0]})})]})}],38316);var F=e.i(52260),P=e.i(19328),I=e.i(38376),B=e.i(83927),U=e.i(18456);let H={shed:(0,h.Z)("/models/street/shed.glb"),fescape:(0,h.Z)("/models/street/fescape.glb"),hotdog:(0,h.Z)("/models/street/hotdog.glb")};for(let e of Object.values(H))(0,U.D)("street",e);let j=(e,t,a,r)=>a>=8&&r>=21&&Math.abs(43758.5453*Math.sin(12.9898*e+78.233*t))%1<.14;function W(e,t,a,r,o,n,l=0){let s=new i.kG(e,t,a);return l&&s.rotateZ(l),s.translate(r,o,n),s}e.s(["U",0,function({city:e,skip:o}){let n=(0,U.s)(H.shed).scene,s=(0,U.s)(H.fescape).scene,c=(0,U.s)(H.hotdog).scene,u=(0,a.useMemo)(()=>{let t=function(e,t){let a=e.buildings,r=a.polys,i=(0,f.f)(4242),o=[],n=[],s=[],c=0,u=0;for(let e=0;e<r.count.length;e++){let s=r.len[u],f=c;for(let t=0;t<r.count[e];t++)c+=r.len[u+t];u+=r.count[e];let d=a.h[e];if(d<12||s<3||0===a.style[e])continue;let m=0,p=0;for(let e=0;e<s;e++)m+=r.xy[(f+e)*2],p+=r.xy[(f+e)*2+1];if(m/=s,p/=s,!(0,I.x)(m,p)||t(e,m,p,d))continue;let g=0;for(let e=0;e<s;e++){let t=(e+1)%s;g+=r.xy[(f+e)*2]*r.xy[(f+t)*2+1]-r.xy[(f+t)*2]*r.xy[(f+e)*2+1]}let v=g/2>0,x=e=>v?f+(s-e)%s:f+e;for(let t=0;t<s;t++){let c=x(t),f=x((t+1)%s),u=r.xy[2*c],m=r.xy[2*c+1],p=r.xy[2*f]-u,g=r.xy[2*f+1]-m,v=Math.hypot(p,g);if(v<6)continue;let y=p/v,w=g/v,b=-w,M=Math.atan2(b,y),S=u+p/2,_=m+g/2;if(2===(0,P.T)(S+3*b,_+3*y)){if(j(e,t,v,d)&&a.year[e]<1950){let e=Math.min(1,(d-6)/16),t=.25+.5*i();n.push({x:u+p*t+.04*b,y:4.9,z:m+g*t+.04*y,yaw:M,s:e})}else if(a.year[e]>0&&a.year[e]<1945&&v>=9&&i()<(h.u?.03:.06)){let e=Math.min(6,Math.floor((v-1)/2.92)),t=v/2-2.92*e/2,a=1.98,r=!0;for(let a=0;a<e&&r;a++){let e=t+(a+.5)*2.92;2!==(0,P.T)(u+y*e+3.86*b,m+w*e+3.86*y)&&(r=!1)}if(!r)continue;for(let r=0;r<e;r++){let e=t+(r+.5)*2.92;o.push({x:u+y*e+b*a,y:l.C,z:m+w*e+y*a,yaw:M+Math.PI/2,s:1})}}}}}for(let e=0;e<l.u;e++){let t=(0,l.R)(e);for(let a=0;a<l.Q.length;a++){if(i()>.28)continue;let r=.5>i()?-1:1,o=.5>i()?-1:1,n=l.Q[a]+r*((0,l.M)(a)/2+2.2),c=t+o*((0,l.A)(e)/2+2.2);(0,I.x)(n,c)&&2===(0,P.T)(n,c)&&2===(0,P.T)(n+1.2*r,c)&&s.push({x:n,y:l.C,z:c,yaw:6.28*i(),s:1})}}return{shed:o,fescape:n,hotdog:s}}(e,o),a=[];for(let[e,r,o]of[["shed",n,!1],["fescape",s,!1],["hotdog",c,!1]])for(let n of function(e){let t=[];return e.traverse(e=>{e.isMesh&&t.push(e)}),t}(r)){let r=n.material;"fescape"===e&&(r.side=i.Vs),a.push(...function(e,t,a,r){let o=new Map;for(let t of e){let e=4096*Math.floor(t.x/900)+Math.floor(t.z/900),a=o.get(e);a||o.set(e,a=[]),a.push(t)}let n=new i.nd,l=new i.as,s=new i.cE(0,1,0),c=new i.cE,f=new i.cE,h=[];for(let e of o.values()){let o=new i.YJ(t,a,e.length);e.forEach((e,t)=>{l.setFromAxisAngle(s,e.yaw),o.setMatrixAt(t,n.compose(c.set(e.x,e.y,e.z),l,f.setScalar(e.s)))}),o.instanceMatrix.needsUpdate=!0,o.computeBoundingSphere(),o.castShadow=!1,o.receiveShadow=!1,o.matrixAutoUpdate=!1,h.push(o)}return h}(t[e],(0,B.f)(n),r,o))}return a},[e,o,n,s,c]);return(0,r.f)(({camera:e})=>{if(!h.u)return;let t=e.position;for(let e of u){let a=e.boundingSphere;e.visible=t.distanceTo(a.center)-a.radius<700}}),(0,t.jsx)("group",{children:u.map((e,a)=>(0,t.jsx)("primitive",{object:e},a))})},"A",0,j],92827);let O=new i.aV({color:1776153,roughness:.72,metalness:.45,side:i.Vs});e.s(["f",0,function({city:e,skip:r}){let o=(0,a.useMemo)(()=>{let t=function(){let e=[];for(let t of(e.push(W(2.2,.07,1.05,0,0,.55)),e.push(W(2.2,.07,.07,0,.5,1.05)),[-1.1,-.55,0,.55,1.1]))e.push(W(.05,1.05,.05,t,.52,1.05));for(let t of(e.push(W(2.25,.06,.06,0,1.05,1.05)),[-1.1,1.1]))e.push(W(.06,.06,1.05,t,1.05,.55)),e.push(W(.05,1.05,.05,t,.52,.12));e.push(W(2.2,.06,.05,0,-.18,1));let t=Math.hypot(2.2,3.6),a=Math.atan2(-3.6,2.2);for(let r of[.3,.9])e.push(W(t,.07,.05,0,-1.8,r,a));return e.push(W(t,.03,.55,0,-1.8,.6,a)),e.push(W(t,.04,.04,0,-.8,.95,a)),(0,F.f)(e.map(e=>e.toNonIndexed()))}(),a=function(e,t){let a=e.buildings,r=a.polys,i=(0,f.f)(777),o=h.u?.1:.18,n=[],l=0,s=0;for(let e=0;e<r.count.length;e++){let c=r.len[s],f=l;for(let t=0;t<r.count[e];t++)l+=r.len[s+t];s+=r.count[e];let h=a.h[e];if(h<14||h>55||0===a.style[e]||c<3||a.year[e]>=1945)continue;let u=0,d=0;for(let e=0;e<c;e++)u+=r.xy[(f+e)*2],d+=r.xy[(f+e)*2+1];if(u/=c,d/=c,!(0,I.x)(u,d)||t(e,u,d,h))continue;let m=0;for(let e=0;e<c;e++){let t=(e+1)%c;m+=r.xy[(f+e)*2]*r.xy[(f+t)*2+1]-r.xy[(f+t)*2]*r.xy[(f+e)*2+1]}let p=m/2>0,g=e=>p?f+(c-e)%c:f+e;for(let t=0;t<c;t++){let a=g(t),l=g((t+1)%c),s=r.xy[2*a],f=r.xy[2*a+1],u=r.xy[2*l]-s,d=r.xy[2*l+1]-f,m=Math.hypot(u,d);if(m<6.5||m>45||i()>o||j(e,t,m,h))continue;let p=-d/m,v=u/m,x=.3+.4*i(),y=s+u*x,w=f+d*x,b=(0,P.T)(y+4*p,w+4*v);if(1!==b&&2!==b)continue;let M=Math.atan2(p,v),S=0;for(let e=7.4;e<h-2.2&&S<8;e+=3.6,S++)n.push({x:y+.02*p,y:e,z:w+.02*v,yaw:M})}}return n}(e,r),o=new Map;for(let e of a){let t=4096*Math.floor(e.x/400)+Math.floor(e.z/400),a=o.get(t);a||o.set(t,a=[]),a.push(e)}let n=new i.nd,l=new i.as,s=new i.cE(0,1,0),c=new i.cE(1,1,1),u=new i.cE,d=[];for(let e of o.values()){let a=new i.YJ(t,O,e.length);e.forEach((e,t)=>{l.setFromAxisAngle(s,e.yaw),a.setMatrixAt(t,n.compose(u.set(e.x,e.y,e.z),l,c))}),a.instanceMatrix.needsUpdate=!0,a.computeBoundingSphere(),a.receiveShadow=!0,d.push(a)}return d},[e,r]);return(0,t.jsx)("group",{children:o.map((e,a)=>(0,t.jsx)("primitive",{object:e},a))})}],96377);let G=[{name:"Brownstone_Classic_1",w:19.37,d:23.05,h:13.22},{name:"Brownstone_Commercial_1",w:21.73,d:22.91,h:10.39},{name:"Brownstone_Commercial_1_C",w:21.28,d:22.45,h:16.16},{name:"Brownstone_FlatFacade_1",w:30,d:21.38,h:22.77},{name:"Brownstone_FlatFacade_12",w:13.32,d:20.6,h:18.73},{name:"Brownstone_FlatFacade_12_B",w:13.32,d:20.6,h:18.73},{name:"Brownstone_FlatFacade_12_C",w:13.32,d:20.6,h:18.73},{name:"Brownstone_FlatFacade_2",w:28.39,d:21.4,h:21.04},{name:"Brownstone_FlatFacade_3",w:20,d:21.45,h:21.18},{name:"Brownstone_FlatFacade_4",w:10,d:20.48,h:21.04},{name:"Brownstone_FlatFacade_5",w:20,d:21.47,h:21.85},{name:"Brownstone_FlatFacade_6",w:30,d:20.98,h:21.06},{name:"Brownstone_FlatFacade_6_B",w:30,d:20.48,h:13.47},{name:"Brownstone_FlatFacade_7",w:20,d:21.45,h:21.04},{name:"Brownstone_FlatFacade_7_B",w:20,d:21.43,h:13.45},{name:"Brownstone_FlatFacade_8",w:10,d:21.43,h:21.04},{name:"Brownstone_FlatFacade_9",w:30,d:21.69,h:20.38},{name:"Brownstone_FlatFacade_9_B",w:30,d:21.3,h:12.79},{name:"Brownstone_FlatFacade_9_C",w:30,d:21.69,h:20.38},{name:"Brownstone_Harlem_1",w:10.15,d:28.64,h:15.5},{name:"Brownstone_Harlem_1_B",w:30.44,d:28.64,h:15.5},{name:"Brownstone_Lowrise_1",w:30.69,d:30.68,h:13.94},{name:"Brownstone_Lowrise_1_B",w:30.69,d:30.68,h:17.77},{name:"Brownstone_Lowrise_1_C",w:30.69,d:30.68,h:13.99}];e.s(["S",0,G,"t",0,function(e,t){let a=e.buildings,r=a.polys,i=new Set,o=[],n=h.u?400:1e3,l=0,s=0;for(let e=0;e<r.count.length&&o.length<n;e++){let n=r.len[s],c=l,h=r.count[e];for(let e=0;e<h;e++)l+=r.len[s+e];s+=h;let u=a.h[e];if(1!==h||n<4||n>10||u<9||u>27||0===a.style[e]||!(a.year[e]>0&&a.year[e]<1940))continue;let d=0,m=0,p=0;for(let e=0;e<n;e++){let t=(e+1)%n,a=r.xy[(c+e)*2],i=r.xy[(c+e)*2+1];d+=a/n,m+=i/n,p+=a*r.xy[(c+t)*2+1]-r.xy[(c+t)*2]*i}if(!(0,I.x)(d,m)||t(e,d,m))continue;let g=Math.abs(p)/2,v=p/2>0,x=e=>v?c+(n-e)%n:c+e,y=-1,w=0;for(let e=0;e<n;e++){let t=x(e),a=x((e+1)%n),i=r.xy[2*a]-r.xy[2*t],o=r.xy[2*a+1]-r.xy[2*t+1],l=Math.hypot(i,o);if(l<=w)continue;let s=r.xy[2*t]+i/2-o/l*3,c=r.xy[2*t+1]+o/2+i/l*3,f=(0,P.T)(s,c);(1===f||2===f)&&(y=e,w=l)}if(y<0||w<7.5)continue;let b=x(y),M=x((y+1)%n),S=r.xy[2*b],_=r.xy[2*b+1],L=(r.xy[2*M]-S)/w,E=(r.xy[2*M+1]-_)/w,A=-E,C=1/0,D=-1/0,z=0;for(let e=0;e<n;e++){let t=r.xy[(c+e)*2]-S,a=r.xy[(c+e)*2+1]-_,i=t*L+a*E;C=Math.min(C,i),D=Math.max(D,i),z=Math.max(z,-(t*A+a*L))}let k=D-C;if(z<9||k-w>2||g<.86*k*z)continue;let R=(0,f.f)(7919*e+13),T=[];if(G.forEach((e,t)=>{let a=u/e.h;if(a<.72||a>1.35)return;let r=Math.max(1,Math.round(k/e.w)),i=k/(r*e.w);i<.8||i>1.25||r>4||T.push({m:t,k:r,sx:i,sy:a})}),!T.length)continue;let N=T[Math.floor(R()*T.length)],F=Math.min(1.6,Math.max(.45,z/G[N.m].d)),B=Math.atan2(A,L),U=k/N.k;for(let e=0;e<N.k;e++){let t=C+(e+.5)*U;o.push({model:N.m,x:S+L*t,z:_+E*t,yaw:B,sx:N.sx,sy:N.sy,sz:F})}i.add(e)}return{swapped:i,swaps:o}}],652);let q=(0,h.Z)("/models/street/brownstones.glb");(0,U.D)("street",q),e.s(["f",0,function({swaps:e}){let{scene:r}=(0,U.s)(q),o=(0,a.useMemo)(()=>{let t=new Map;for(let a of e){let e=`${a.model}:${Math.floor(a.x/1400)},${Math.floor(a.z/1400)}`,r=t.get(e);r||t.set(e,r={model:a.model,list:[]}),r.list.push(a)}let a=new Map,o=e=>{let t=a.get(e);if(!t){let r=e.clone();/Masked/.test(r.name)&&(r.alphaTest=.5,r.side=i.Vs),r.onBeforeCompile=e=>(0,n.Z)(e),r.customProgramCacheKey=()=>"brownstone",a.set(e,t=r)}return t},l=new i.nd,s=new i.as,c=new i.cE(0,1,0),f=new i.cE,h=new i.cE,u=[];for(let{model:e,list:a}of t.values()){let t=r.getObjectByName(G[e].name);t&&t.traverse(e=>{if(!e.isMesh)return;let t=(0,B.f)(e),r=new i.YJ(t,o(e.material),a.length);a.forEach((e,t)=>{s.setFromAxisAngle(c,e.yaw),r.setMatrixAt(t,l.compose(f.set(e.x,0,e.z),s,h.set(e.sx,e.sy,e.sz)))}),r.instanceMatrix.needsUpdate=!0,r.computeBoundingSphere(),r.castShadow=!1,r.receiveShadow=!0,u.push(r)})}return u},[r,e]);return(0,t.jsx)("group",{children:o.map((e,a)=>(0,t.jsx)("primitive",{object:e},a))})}],16328);let $=`
attribute vec4 aTree;   // base x, y, z, scale
attribute vec2 aTree2;  // yaw, brightness
uniform float uGrid;
uniform float uRadius;
uniform float uHeight;
varying vec2 vUvA;
varying vec2 vUvB;
varying vec2 vUvC;
varying vec3 vWts;
varying vec2 vFA;
varying vec2 vFB;
varying vec2 vFC;
varying float vYaw;
varying float vTint;
vec3 impDecode(vec2 cell) {
  vec2 p = (cell + 0.5) / uGrid * 2.0 - 1.0;
  vec2 q = vec2(p.x + p.y, p.x - p.y) * 0.5;
  return normalize(vec3(q.x, 1.0 - abs(q.x) - abs(q.y), q.y));
}
vec2 impEncode(vec3 d) {
  d /= abs(d.x) + abs(d.y) + abs(d.z);
  return vec2(d.x + d.z, d.x - d.z) * 0.5 + 0.5;
}
mat3 impRotY(float a) { float c = cos(a); float s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
void impBasis(vec3 d, out vec3 r, out vec3 u) {
  r = cross(vec3(0.0, 1.0, 0.0), d);
  r = length(r) < 1e-4 ? vec3(1.0, 0.0, 0.0) : normalize(r);
  u = cross(d, r);
}
vec2 impFrameUv(vec2 cell, mat3 ry, vec3 offs, float size) {
  vec3 r; vec3 u;
  impBasis(ry * impDecode(cell), r, u);
  return vec2(dot(offs, r), dot(offs, u)) / size + 0.5;
}`,V=`
  float impS = aTree.w;
  vec3 impCentre = aTree.xyz + vec3(0.0, uHeight * 0.5 * impS, 0.0);
  bool impPersp = isPerspectiveMatrix(projectionMatrix);
  vec3 toCam = impPersp ? normalize(cameraPosition - impCentre) : normalize(vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]));
  mat3 impRy = impRotY(aTree2.x);
  vec3 impLocal = transpose(impRy) * toCam;
  impLocal.y = max(impLocal.y, 0.03);
  impLocal = normalize(impLocal);
  vec2 g = clamp(impEncode(impLocal) * uGrid - 0.5, 0.0, uGrid - 1.0);
  vec2 b = floor(g);
  vec2 f = g - b;
  vFA = b;
  vFC = min(b + 1.0, uGrid - 1.0);
  vFB = f.x > f.y ? vec2(min(b.x + 1.0, uGrid - 1.0), b.y) : vec2(b.x, min(b.y + 1.0, uGrid - 1.0));
  vWts = f.x > f.y ? vec3(1.0 - f.x, f.x - f.y, f.y) : vec3(1.0 - f.y, f.y - f.x, f.x);
  vec3 impR; vec3 impU;
  impBasis(toCam, impR, impU);
  float impSize = 2.0 * uRadius * impS;
  vec3 impOffs = (impR * position.x + impU * position.y) * impSize;
  vUvA = impFrameUv(vFA, impRy, impOffs, impSize);
  vUvB = impFrameUv(vFB, impRy, impOffs, impSize);
  vUvC = impFrameUv(vFC, impRy, impOffs, impSize);
  vYaw = aTree2.x;
  vTint = aTree2.y;
  // the card leans toward the viewer a little so a tilted one doesn't cut into the ground beneath it
  vec3 transformed = impCentre + impOffs + toCam * uRadius * impS * 0.3;`,K=`
uniform sampler2D uAlbedo;
uniform sampler2D uNormalAtlas;
uniform float uGrid;
varying vec2 vUvA;
varying vec2 vUvB;
varying vec2 vUvC;
varying vec3 vWts;
varying vec2 vFA;
varying vec2 vFB;
varying vec2 vFC;
varying float vYaw;
varying float vTint;
vec4 impSample(sampler2D t, vec2 cell, vec2 uv) {
  return texture2D(t, (cell + clamp(uv, 0.002, 0.998)) / uGrid);
}
vec4 impBlend(sampler2D t) {
  return impSample(t, vFA, vUvA) * vWts.x + impSample(t, vFB, vUvB) * vWts.y + impSample(t, vFC, vUvC) * vWts.z;
}
mat3 impRotYF(float a) { float c = cos(a); float s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }`;e.s(["s",0,function(e){let t={uAlbedo:{value:e.albedo},uNormalAtlas:{value:e.normal},uGrid:{value:e.grid},uRadius:{value:e.radius},uHeight:{value:e.height}},a=new i.aV({color:"#ffffff",roughness:.78,metalness:0,side:i.Vs});a.onBeforeCompile=e=>{(0,n.Z)(e),Object.assign(e.uniforms,t),e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
${$}`).replace("#include <begin_vertex>",V),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
${K}`).replace("#include <map_fragment>",`vec4 impC = impBlend(uAlbedo);
         if (impC.a < 0.45) discard;
         diffuseColor.rgb *= impC.rgb * vTint;`).replace("#include <normal_fragment_maps>",`vec3 impN = normalize(impBlend(uNormalAtlas).xyz * 2.0 - 1.0);
         impN = impRotYF(vYaw) * impN;
         normal = normalize((viewMatrix * vec4(impN, 0.0)).xyz);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
         #ifdef USE_FOG
           // leaves glow when the sun shines through them
           float impBack = pow(max(dot(normalize(vFogWorld - cameraPosition), fogSunDir), 0.0), 4.0);
           totalEmissiveRadiance += diffuseColor.rgb * fogColGlow * impBack * 3.0;
         #endif`)},a.customProgramCacheKey=()=>"impostor-v1";let r=new i.QQ({depthPacking:i.Wq,side:i.Vs});return r.onBeforeCompile=e=>{Object.assign(e.uniforms,t),e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
${$}`).replace("#include <begin_vertex>",V),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
${K}`).replace("#include <map_fragment>","if (impBlend(uAlbedo).a < 0.45) discard;")},r.customProgramCacheKey=()=>"impostor-depth-v1",{mat:a,depth:r}},"r",0,function(e,t){let a=new i.Kx;a.setAttribute("position",new i.ki([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),a.setAttribute("normal",new i.ki([0,0,1,0,0,1,0,0,1,0,0,1],3)),a.setIndex([0,1,2,0,2,3]);let r=new Float32Array(4*e.length),o=new Float32Array(2*e.length),n=0,l=new i.VQ;return e.forEach((e,t)=>{r.set([e.x,e.y,e.z,e.s],4*t),o.set([e.yaw,e.tint],2*t),n=Math.max(n,e.s),l.expandByPoint(new i.cE(e.x,e.y,e.z))}),a.setAttribute("aTree",new i.VZ(r,4)),a.setAttribute("aTree2",new i.VZ(o,2)),a.instanceCount=e.length,l.expandByScalar(t.radius*n*1.4),l.max.y+=t.height*n,a.boundingBox=l,a.boundingSphere=l.getBoundingSphere(new i.L0),a}],54102);let Z=["hydrant","hydrant_aged","can","can_rust","trashbag","utility_box"].map(e=>(0,h.Z)(`/models/props/${e}.glb`));(0,U.D)("street",Z);function X(e,t){let a=e.index?e.toNonIndexed():e;return a.deleteAttribute("uv"),a.setAttribute("aPart",new i.ki(Array(a.attributes.position.count).fill(t),1)),a}let Q=(e,t,a,r,o,n)=>{let l=new i.o1(t,e,a,r,1);return l.translate(0,n+a/2,0),X(l,o)},Y=(e,t,a,r,o,n,l)=>{let s=new i.kG(e,t,a);return s.translate(r,o,n),X(s,l)},J=h.u?480:320,ee=h.u?380:900,et=h.u?80:260;e.s(["f",0,function(){let e=(0,U.s)(Z),{meshes:o,mat:u,models:d}=(0,a.useMemo)(()=>{let t,a,r,o,s,u,d=((t=new i.aV({color:"#ffffff",roughness:.5,metalness:.3})).onBeforeCompile=e=>{(0,n.Z)(e),e.uniforms.uNight=c.f.uNight,e.uniforms.uTime=c.f.uTime,e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
attribute float aPart;
flat varying float vPart;
varying vec3 vFW;`).replace("#include <begin_vertex>",`#include <begin_vertex>
         vPart = aPart;
         vec4 fw = vec4(transformed, 1.0);
         #ifdef USE_INSTANCING
           fw = instanceMatrix * fw;
         #endif
         vFW = (modelMatrix * fw).xyz;`),e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
         uniform float uNight;
         uniform float uTime;
         flat varying float vPart;
         varying vec3 vFW;
         float fRough;
         float fMetal;
         vec3 fEmit;`).replace("#include <color_fragment>",`#include <color_fragment>
         {
           int part = int(vPart + 0.5);
           fRough = 0.55;
           fMetal = 0.5;
           fEmit = vec3(0.0);
           // the signal cycle: 40 s, avenues first, offset up the avenue for a green wave
           float ph = mod(uTime - vFW.z / 12.0, 40.0);
           // the avenues the bike rides up hold the green for it
           if ((abs(vFW.x) < 26.0 && vFW.z > -805.0 && vFW.z < -470.0) || (abs(vFW.x + 255.0) < 26.0 && vFW.z > -1615.0 && vFW.z < -790.0)) ph = 5.0;
           float aveG = step(ph, 24.0);
           float aveA = step(24.0, ph) * step(ph, 27.0);
           float stG = step(27.0, ph) * step(ph, 37.0);
           float stA = step(37.0, ph);
           float glow = 0.6 + 4.0 * uNight;
           if (part == 0) { diffuseColor.rgb = vec3(0.045, 0.05, 0.048); }
           else if (part == 1) { diffuseColor.rgb = vec3(0.9, 0.85, 0.7); fRough = 0.2; fMetal = 0.0; fEmit = vec3(1.0, 0.78, 0.5) * (0.02 + 7.0 * uNight); }
           else if (part == 2) { diffuseColor.rgb = vec3(0.04, 0.042, 0.035); fRough = 0.45; }
           else if (part == 3) { diffuseColor.rgb = vec3(0.12, 0.01, 0.01); fEmit = vec3(1.0, 0.06, 0.03) * glow * (1.0 - aveG - aveA); }
           else if (part == 4) { diffuseColor.rgb = vec3(0.12, 0.07, 0.0); fEmit = vec3(1.0, 0.55, 0.05) * glow * aveA; }
           else if (part == 5) { diffuseColor.rgb = vec3(0.0, 0.1, 0.07); fEmit = vec3(0.1, 1.0, 0.6) * glow * aveG; }
           else if (part == 6) { diffuseColor.rgb = vec3(0.12, 0.01, 0.01); fEmit = vec3(1.0, 0.06, 0.03) * glow * (1.0 - stG - stA); }
           else if (part == 7) { diffuseColor.rgb = vec3(0.12, 0.07, 0.0); fEmit = vec3(1.0, 0.55, 0.05) * glow * stA; }
           else if (part == 8) { diffuseColor.rgb = vec3(0.0, 0.1, 0.07); fEmit = vec3(0.1, 1.0, 0.6) * glow * stG; }
           else if (part == 9) { diffuseColor.rgb = vec3(0.45, 0.04, 0.03); fRough = 0.4; fMetal = 0.2; }
           else if (part == 10) { diffuseColor.rgb = vec3(0.05, 0.12, 0.06); fRough = 0.6; }
           else if (part == 11) { diffuseColor.rgb = vec3(0.02, 0.22, 0.1); fRough = 0.35; fMetal = 0.1; }
           else { diffuseColor.rgb = vec3(0.6, 0.62, 0.62); fRough = 0.35; fMetal = 0.8; }
         }`).replace("#include <roughnessmap_fragment>","#include <roughnessmap_fragment>\nroughnessFactor = fRough;").replace("#include <metalnessmap_fragment>","#include <metalnessmap_fragment>\nmetalnessFactor = fMetal;").replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance += fEmit;")},t.customProgramCacheKey=()=>"furniture-v2",t),m=function(){let e=(0,f.f)(31),t=[],a=(e,t)=>e>l._.x0+20&&e<l._.x1-20&&(!h.u||e>-1100&&e<1500&&t>-2800&&t<400)&&(0,P.a)(e,t)&&!(e>l.v.x0-4&&e<l.v.x1+4&&t>l.v.z0-4&&t<l.v.z1+4),r=e=>(0,l.M)(l.Q.indexOf(e))/2,i=(e,t)=>l.Q.some(a=>Math.abs(e-a)<r(a)+t),o=(e,t)=>{for(let a=0;a<l.u;a++)if(Math.abs(e-(0,l.R)(a))<(0,l.A)(a)/2+t)return!0;return!1},n=e=>(0,l.A)(e)/2+.6;for(let e=0;e<=l.u;e++){let r=(0,l.R)(e),o=n(e);for(let e=l._.x0;e<l._.x1;e+=34){let n=e+17-(l._.x0%34+34)%34,s=e-(l._.x0%34+34)%34;!i(n,14)&&a(n,r-o)&&t.push({g:0,x:n,z:r-o,rot:-Math.PI/2}),!i(s,14)&&a(s,r+o)&&t.push({g:0,x:s,z:r+o,rot:Math.PI/2})}}for(let e of l.Q){let i=r(e);for(let r=l._.z0;r<l._.z1;r+=34){let n=34*Math.round(r/34),l=n+17;!o(n,14)&&a(e-i-.6,n)&&t.push({g:0,x:e-i-.6,z:n,rot:0}),!o(l,14)&&a(e+i+.6,l)&&t.push({g:0,x:e+i+.6,z:l,rot:Math.PI})}}for(let i=0;i<=l.u;i++){let o=(0,l.R)(i);for(let n of l.Q){let s=r(n)+.7,c=(0,l.A)(i)/2+.7;a(n+s,o+c)&&t.push({g:1,x:n+s,z:o+c,rot:0}),a(n-s,o-c)&&t.push({g:1,x:n-s,z:o-c,rot:Math.PI});let f=()=>.3>e()?5:4;a(n-s-1,o+c+1.5)&&t.push({g:f(),x:n-s-1,z:o+c+1.5,rot:6.28*e()}),a(n+s+1.2,o-c-1)&&t.push({g:f(),x:n+s+1.2,z:o-c-1,rot:6.28*e()})}}for(let r=0;r<=l.u;r++){let i=(0,l.R)(r);for(let o=0;o<l.Q.length-1;o++)for(let n of[-1,1]){let s=(l.Q[o]+l.Q[o+1])/2+(e()-.5)*120,c=i+n*((0,l.A)(r)/2+.45);a(s,c)&&t.push({g:.7>e()?2:3,x:s,z:c,rot:6.28*e()})}}for(let r=0;r<=l.u;r++){let o=(0,l.R)(r);for(let n=0;n<l.Q.length-1;n++)for(let s of[-1,1]){if(e()>.45)continue;let c=(l.Q[n]+l.Q[n+1])/2+(e()-.5)*150,f=o+s*((0,l.A)(r)/2+.75);if(!a(c,f)||i(c,12))continue;let h=3+Math.floor(6*e());for(let a=0;a<h;a++){let a=c+(e()-.5)*1.8,r=f+s*e()*.6;t.push({g:6,x:a,z:r,rot:6.28*e(),s:.8+.45*e()})}}}for(let i=0;i<l.u;i++)for(let o of l.Q){if(e()>.3)continue;let n=r(o),s=.5>e()?-1:1,c=o+s*(n+.6),f=(0,l.R)(i)-20-40*e();a(c,f)&&t.push({g:7,x:c,z:f,rot:s>0?-Math.PI/2:Math.PI/2})}let s=new Map;for(let e of t){let t=`${Math.floor(e.x/J)},${Math.floor(e.z/J)},${e.g}`,a=s.get(t);a||s.set(t,a=[]),a.push(e)}let c=[];for(let[e,t]of s){let[a,r,i]=e.split(",").map(Number);c.push({g:i,items:t,cx:(a+.5)*J,cz:(r+.5)*J})}return c}(),p=[{geometry:(a=[Q(.2,.17,.7,8,0,0),Q(.11,.075,8,7,0,.6)],(r=new i.o1(.05,.05,1.3,5,1)).rotateZ(-Math.PI/3.2),r.translate(.55,8.75,0),a.push(X(r,0)),(o=new i.o1(.045,.045,1.2,5,1)).rotateZ(-Math.PI/2),o.translate(1.6,9.1,0),a.push(X(o,0)),a.push(Y(.85,.2,.38,2.2+.1,9.05,0,0)),a.push(Y(.66,.04,.28,2.2+.12,8.94,0,1)),(0,F.f)(a)),material:d},{geometry:(s=[Q(.16,.13,.4,8,0,0),Q(.1,.09,4.6,7,0,.3)],u=(e,t)=>{let a=(0,F.f)([Y(.36,1.02,.26,0,3.75,0,2),Y(.22,.2,.03,0,4.06,.14,t[0]),Y(.22,.2,.03,0,3.75,.14,t[1]),Y(.22,.2,.03,0,3.44,.14,t[2]),Y(.26,.03,.14,0,4.18,.2,2),Y(.26,.03,.14,0,3.87,.2,2),Y(.26,.03,.14,0,3.56,.2,2)]);return a.translate(0,0,.22),a.rotateY(e),a},s.push(u(Math.PI,[3,4,5])),s.push(u(Math.PI/2,[6,7,8])),s.push(Y(1.3,.24,.03,.55,4.75,0,11)),s.push(Y(.03,.24,1.3,0,4.5,-.55,11)),(0,F.f)(s)),material:d},...e.map(e=>{let t,a;return e.scene.traverse(e=>{!t&&e.isMesh&&(t=e)}),(a=t.material.clone()).onBeforeCompile=e=>(0,n.Z)(e),a.customProgramCacheKey=()=>"prop-v1",{geometry:(0,B.f)(t),material:a}})],g=new i.nd,v=new i.nd;return{meshes:m.map(({g:e,items:t,cx:a,cz:r})=>{let o=new i.YJ(p[e].geometry,p[e].material,t.length);return t.forEach((e,t)=>o.setMatrixAt(t,g.makeRotationY(e.rot).multiply(v.makeScale(e.s??1,e.s??1,e.s??1)).setPosition(e.x,l.C,e.z))),o.computeBoundingSphere(),o.receiveShadow=!0,o.matrixAutoUpdate=!1,o.userData.c=[a,r],o}),mat:d,models:p}},[e]);return(0,a.useEffect)(()=>()=>{for(let e of d)e.geometry.dispose(),e.material!==u&&e.material.dispose();for(let e of o)e.dispose();u.dispose()},[o,u,d]),(0,r.f)(({camera:e})=>{let t=e.position,a=s.f.getState().quality,r="low"===a?.5*ee:ee,i="high"===a?et:"medium"===a?.5*et:0;for(let e of o){let[a,o]=e.userData.c,n=Math.max(Math.hypot(t.x-a,t.z-o)-.71*J,0);e.visible=n<r&&t.y<1500,e.castShadow=!1}}),(0,t.jsx)("group",{children:o.map((e,a)=>(0,t.jsx)("primitive",{object:e},a))})}],88699);let ea=[[9.5,-560,1],[-3,-700,.55],[-247,-1050,.6],[-249.5,-1290,1],[-258,-1480,.5]],er=`
attribute vec4 aPuff; // vent x, vent z, phase, strength
uniform float uTime;
varying vec2 vUv;
varying float vAlpha;
varying float vAge;
void main() {
  vUv = uv;
  float rate = 0.12;
  float age = fract(uTime * rate + aPuff.z);
  float s = aPuff.w;
  // rise fast at first, then slow; lean downwind; swell as it cools
  vec3 base = vec3(aPuff.x, 0.0, aPuff.y);
  float h = (1.4 * s + 0.3) + (9.0 * s + 2.5) * (1.0 - pow(1.0 - age, 1.8));
  vec3 c = base + vec3(age * age * 5.5 + sin(aPuff.z * 40.0 + uTime * 0.7) * 0.35 * age, h, sin(aPuff.z * 17.0) * 0.6 * age);
  float size = (0.9 + 5.2 * age) * (0.55 + 0.45 * s);
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  float rot = aPuff.z * 6.28 + age * 0.8;
  vec2 q = mat2(cos(rot), sin(rot), -sin(rot), cos(rot)) * (position.xy * size);
  vec3 wp = c + right * q.x + up * q.y;
  vAlpha = smoothstep(0.0, 0.06, age) * pow(1.0 - age, 1.8) * (0.26 + 0.3 * s);
  vAge = age;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}`,ei=`
uniform sampler2D uMap;
uniform float uNight;
uniform vec3 uSun;
varying vec2 vUv;
varying float vAlpha;
varying float vAge;
void main() {
  float a = texture2D(uMap, vUv).a * vAlpha;
  if (a < 0.003) discard;
  // lit by the day's light, a cool grey in the shade, warm under the street lamps at night
  vec3 day = mix(vec3(0.72, 0.74, 0.78), uSun, 0.35);
  vec3 col = mix(day, vec3(0.16, 0.13, 0.1), uNight) * (0.9 + 0.2 * vAge);
  gl_FragColor = vec4(col, a);
}`;e.s(["f",0,function(){let{mesh:e,mat:o,geo:l}=(0,a.useMemo)(()=>{let e=new i.Kx,t=new i.CQ(1,1);e.index=t.index,e.setAttribute("position",t.attributes.position),e.setAttribute("uv",t.attributes.uv);let a=new Float32Array(56*ea.length*4),r=0;for(let[e,t,i]of ea)for(let o=0;o<56;o++)a.set([e,t,o/56+.01*Math.random(),i],4*r),r++;e.setAttribute("aPuff",new i.VZ(a,4)),e.instanceCount=r;let o=new i.Zg({vertexShader:er,fragmentShader:ei,uniforms:{uTime:c.f.uTime,uNight:c.f.uNight,uMap:{value:function(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),a=(0,f.f)(8);for(let e=0;e<14;e++){let e=64+(a()-.5)*44,r=64+(a()-.5)*44,i=18+26*a(),o=t.createRadialGradient(e,r,0,e,r,i);o.addColorStop(0,"rgba(255,255,255,0.32)"),o.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=o,t.fillRect(0,0,128,128)}let r=new i.Nk(e);return r.colorSpace=i.Ik,r}()},uSun:{value:new i.Es(1,.95,.85)}},transparent:!0,depthWrite:!1}),n=new i.kE(e,o);return n.frustumCulled=!1,n.renderOrder=2,{mesh:n,mat:o,geo:e}},[]),s=(0,a.useMemo)(()=>{let e=document.createElement("canvas");e.width=4,e.height=64;let t=e.getContext("2d");for(let e=0;e<8;e++)t.fillStyle=e%2?"#f2f0ea":"#e8601c",t.fillRect(0,8*e,4,8);let a=new i.Nk(e);a.colorSpace=i.nj;let r=new i.aV({map:a,roughness:.6});return r.onBeforeCompile=e=>(0,n.Z)(e),r},[]);return(0,a.useEffect)(()=>()=>{l.dispose(),o.uniforms.uMap.value.dispose(),o.dispose(),s.map?.dispose(),s.dispose()},[l,o,s]),(0,r.f)(({camera:t})=>{e.visible=t.position.y<260}),(0,t.jsxs)("group",{children:[(0,t.jsx)("primitive",{object:e}),ea.filter(e=>e[2]>=1).map(([e,a])=>(0,t.jsx)("mesh",{position:[e,1.1,a],material:s,castShadow:!1,receiveShadow:!1,children:(0,t.jsx)("cylinderGeometry",{args:[.32,.36,2.2,14,1]})},`${e},${a}`))]})}],68818)},56863,64162,81556,94172,54008,38376,27391,e=>{var t=e.i(71645),a=e.i(90072),r=e.i(42463),i=e.i(78785),uF=e.i(98903);let o=["Facade001","Facade002","Facade003","Facade004","Facade005","Facade006","Facade016","Facade018A","Facade018B","Facade018C","Facade019A","Facade019B","Facade019C","Facade020A","Facade020B","Facade020C","Asphalt033","PavingStones142","Grass004","Gravel043","Concrete034"],n=o.map(e=>`/textures/city/${e}_c.jpg`),l=o.map(e=>`/textures/city/${e}_nr.jpg`),s=i.V?256:512,c=i.u?256:512;function f(e,t,r,o){let n=new a.N(e,t,t,r);return n.format=a.W1,n.type=a.Zi,n.wrapS=n.wrapT=a.FP,n.minFilter=a.Q4,n.magFilter=a.VV,n.generateMipmaps=!0,n.anisotropy=8,n.colorSpace=o?a.nj:a.Ik,n.needsUpdate=!0,i.u&&(n.onUpdate=()=>{n.image.data=null,n.onUpdate=null}),n}function h(e,t){let a=new Uint8Array(t*t*4*e.length),r=document.createElement("canvas");r.width=r.height=t;let i=r.getContext("2d",{willReadFrequently:!0});return e.forEach((e,r)=>{i.setTransform(1,0,0,-1,0,t),i.drawImage(e,0,0,t,t),a.set(i.getImageData(0,0,t,t).data,r*t*t*4)}),r.width=r.height=1,a}async function u(){let[e,t]=await Promise.all([Promise.all(n.map(e=>(0,r.H)(e,!1))),Promise.all(l.map(e=>(0,r.H)(e,!1)))]);return{color:h(e,s),normal:h(t,c)}}let d=null,m=()=>{let t,r,i,o;return d??=("u"<typeof OffscreenCanvas?u():(t=a.rA,i=new Set(r=[...n,...l].map(e=>new URL(e,location.href).href)),r.forEach(e=>t.itemStart(e)),o=e=>{for(let a of i)e&&t.itemError(a),t.itemEnd(a);i.clear()},new Promise((a,l)=>{let f=e.r(86998)(Worker,{type:"module"});f.onmessage=e=>{let r=e.data;if(r.loaded){i.delete(r.loaded)&&t.itemEnd(r.loaded);return}f.terminate(),o(!!r.error),!r.error&&r.color&&r.normal?a({color:r.color,normal:r.normal}):l(Error(r.error??"city textures: empty reply"))},f.onerror=e=>{f.terminate(),o(!0),l(Error(e.message))},f.postMessage({size:s,normalSize:c,color:r.slice(0,n.length),normal:r.slice(n.length)})})).catch(u)).then(({color:e,normal:t})=>({color:f(e,s,n.length,!0),normal:f(t,c,l.length,!1)}))};e.s(["E",0,m,"O",0,()=>(0,t.use)(m())],56863);var p=e.i(99372),g=e.i(8175),v=e.i(84670),x=e.i(50738);let y=[{text:"DELI & GROCERY",sub:"OPEN 24 HOURS",bg:"#0f5132",fg:"#f5f1e6",face:"sans",kind:0},{text:"PIZZA",sub:"BY THE SLICE",bg:"#b3121b",fg:"#fff4d6",face:"caps",kind:1},{text:"PHARMACY",bg:"#f4f6f7",fg:"#0b5cad",face:"sans",kind:3},{text:"Bagels",sub:"EST. 1987",bg:"#1d1d1f",fg:"#f2c14e",face:"italic",kind:1},{text:"Nail Spa",bg:"#f7d6e0",fg:"#7a2048",face:"script",kind:2},{text:"LAUNDROMAT",sub:"WASH · DRY · FOLD",bg:"#1e5aa8",fg:"#ffffff",face:"caps",kind:3},{text:"Wine & Spirits",bg:"#3b0d18",fg:"#e9d8a6",face:"serif",kind:4},{text:"HARDWARE",sub:"KEYS CUT",bg:"#f2b705",fg:"#1d1d1f",face:"sans",kind:0},{text:"Coffee",sub:"ESPRESSO BAR",bg:"#2b1a12",fg:"#f3e9dc",face:"italic",kind:1},{text:"DINER",sub:"BREAKFAST ALL DAY",bg:"#c8102e",fg:"#ffffff",face:"caps",kind:1},{text:"THAI KITCHEN",bg:"#1b4332",fg:"#ffd166",face:"sans",kind:4},{text:"SUSHI",bg:"#f8f5ef",fg:"#9b2226",face:"caps",kind:1},{text:"BARBER",sub:"WALK-INS WELCOME",bg:"#12263a",fg:"#ffffff",face:"caps",kind:2},{text:"Flowers",bg:"#ffffff",fg:"#2d6a4f",face:"script",kind:2},{text:"Books",sub:"NEW & USED",bg:"#0b3954",fg:"#fefae0",face:"serif",kind:0},{text:"SHOES",bg:"#000000",fg:"#ffffff",face:"sans",kind:2},{text:"OPTICAL",sub:"EYE EXAMS",bg:"#e9ecef",fg:"#343a40",face:"sans",kind:2},{text:"PHONE REPAIR",bg:"#ff6b00",fg:"#ffffff",face:"mono",kind:3},{text:"HALAL GRILL",bg:"#006d77",fg:"#ffffff",face:"caps",kind:1},{text:"TACOS",bg:"#ffbe0b",fg:"#9d0208",face:"caps",kind:1},{text:"RAMEN",bg:"#1a1a1a",fg:"#e63946",face:"caps",kind:4},{text:"Bakery",bg:"#fdf0d5",fg:"#780000",face:"script",kind:1},{text:"FITNESS",sub:"OPEN 5AM",bg:"#111111",fg:"#ff2a2a",face:"sans",kind:3},{text:"City Savings Bank",bg:"#0a2463",fg:"#ffffff",face:"serif",kind:3},{text:"MOON FILMS",sub:"SHOOT · EDIT · VFX",bg:"#050505",fg:"#ffffff",face:"caps",kind:2},{text:"GENZ.WEBDEV",sub:"WE SHIP ON FRIDAYS",bg:"#0d1b2a",fg:"#64dfdf",face:"mono",kind:3},{text:"24 FPS CAMERAS",sub:"RENTALS · REPAIRS",bg:"#222222",fg:"#ffd60a",face:"sans",kind:0},{text:"CUT & GRADE",sub:"HAIR · COLOR",bg:"#ffffff",fg:"#111111",face:"caps",kind:2},{text:"404 PIZZA",sub:"SLICE NOT FOUND",bg:"#9b111e",fg:"#ffffff",face:"mono",kind:1},{text:"The Commit Café",bg:"#2b2d42",fg:"#edf2f4",face:"italic",kind:1},{text:"Keyframe Bakery",bg:"#ffe8d6",fg:"#6b4226",face:"serif",kind:1},{text:"LIQUORS",bg:"#000000",fg:"#ff3b3b",face:"caps",kind:4}],w=y.map(e=>e.kind),b=y.length,M={sans:e=>`700 ${e}px InterUI, Arial, sans-serif`,caps:e=>`${1.25*e}px BebasMask, Impact, sans-serif`,serif:e=>`${1.1*e}px SerifUI, Georgia, serif`,italic:e=>`italic ${1.15*e}px SerifUI, Georgia, serif`,script:e=>`${1.3*e}px ScriptUI, cursive`,mono:e=>`700 ${.92*e}px MonoUI, monospace`};e.s(["K",0,2,"H",0,b,"_",0,w,"G",0,16,"e",0,function(){let e=i.u?.5:1,t=document.createElement("canvas");t.width=2048*e,t.height=2048*e;let r=t.getContext("2d");r.fillStyle="#202020",r.fillRect(0,0,t.width,t.height),r.scale(e,e);let o=new a.Nk(t);return o.colorSpace=a.nj,o.anisotropy=8,o.wrapS=o.wrapT=a.Jr,(0,x.f)().then(()=>{y.forEach((e,t)=>(function(e,t,r,i){var o;let n,l=e.createLinearGradient(0,i,0,i+128);l.addColorStop(0,t.bg),l.addColorStop(1,(o=t.bg,n=new a.Es(o),`#${n.offsetHSL(0,0,-.09).getHexString()}`)),e.fillStyle=l,e.fillRect(r,i,1024,128);let s=t.sub?62:74;e.font=M[t.face](s);let c=.06*("sans"===t.face||"caps"===t.face||"mono"===t.face),f=()=>e.measureText(t.text).width+c*s*(t.text.length-1);for(;f()>573.44&&s>20;)s-=2,e.font=M[t.face](s);e.fillStyle=t.fg,e.textBaseline="middle";let h=f(),u=i+(t.sub?53.76:67.84),d=r+(1024-h)/2;for(let a of(e.shadowColor="rgba(0,0,0,0.35)",e.shadowBlur=4,e.shadowOffsetY=2,t.text))e.fillText(a,d,u),d+=e.measureText(a).width+c*s;if(e.shadowColor="transparent",t.sub){e.font="600 18px InterUI, Arial, sans-serif";let a=r+(1024-(e.measureText(t.sub).width+3*(t.sub.length-1)))/2;for(let r of(e.globalAlpha=.85,t.sub))e.fillText(r,a,i+102.4),a+=e.measureText(r).width+3;e.globalAlpha=1}})(r,e,t%2*1024,128*Math.floor(t/2))),(0,i.X)(o),o.needsUpdate=!0}),o}],64162);let S=`
uniform sampler2DArray uFacade;
uniform sampler2DArray uFacadeN;
uniform vec2 uTile[${v.I.length}];
uniform sampler2D uSigns;
uniform float uSignKind[${b}];
varying vec3 vCW;
varying vec3 vCN;
varying float vFaceU;
flat varying float vFaceW;
flat varying vec4 vMeta; // layer, roof layer, base height, seed
uniform float uNight;
uniform float uTime;
uniform vec2 uScan; // the "this city is a website" scan: front x (sweeping west), strength
vec3 cityNW;
float cityRough;
float cityGlass;
float cityMetal;
vec3 cityEmit;
float cHash(float n) { return fract(sin(n * 91.7 + 0.13) * 43758.5453); }
/** an antialiased grid line every period (m) along x */
float cityLine(float x, float period) {
  float f = abs(fract(x / period + 0.5) - 0.5) * period;
  float w = fwidth(x) * 1.5;
  return 1.0 - smoothstep(w * 0.5, w + 1e-4, f);
}

// ---------------------------------------------------------------- shop interiors
// Goods on shelves: q.x runs along the wall, q.y up from the floor.
vec3 shopShelves(vec2 q, float seed, vec3 wall) {
  if (q.y < 0.18 || q.y > 2.1) return wall;
  float slot = floor((q.y - 0.18) / 0.48);
  float sy = (q.y - 0.18) - slot * 0.48;
  if (sy < 0.035) return vec3(0.72);
  float cw = 0.11 + 0.1 * cHash(slot * 3.1 + seed * 13.0);
  float cell = floor(q.x / cw);
  float id = cHash(cell * 1.7 + slot * 31.3 + seed * 7.1);
  float ht = 0.16 + 0.26 * cHash(id * 9.1);
  if (sy > ht || fract(q.x / cw) < 0.1 || id < 0.07) return wall * 0.35;
  vec3 c = 0.5 + 0.5 * cos(6.2831 * (id * 2.7 + vec3(0.0, 0.33, 0.67)));
  return mix(c, vec3(0.92), 0.3) * (0.7 + 0.3 * sy / ht);
}

// Garments on a rail: q.x along the wall, q.y up.
vec3 shopRack(vec2 q, float seed, vec3 wall) {
  if (q.y > 1.62 && q.y < 1.66) return vec3(0.6);
  if (q.y < 0.75 || q.y > 1.62) return wall;
  float cell = floor(q.x / 0.09);
  float id = cHash(cell * 2.3 + seed * 5.0);
  float len = 0.75 + 0.35 * cHash(id * 4.1);
  if (q.y < 1.62 - len * 0.85 || id < 0.12) return wall;
  vec3 tone = mix(vec3(0.12, 0.13, 0.16), vec3(0.75, 0.68, 0.6), cHash(id * 7.7));
  tone = mix(tone, 0.5 + 0.5 * cos(6.2831 * (seed + vec3(0.0, 0.33, 0.67))), 0.25 * step(0.7, cHash(id * 3.3)));
  return tone * (0.75 + 0.25 * fract(q.x / 0.09));
}

// Ray-cast the room behind the glass. p is on the glass in room space (x across the
// shop, y up from the floor, z into the room); d is the view ray in the same frame.
vec3 shopInterior(vec3 p, vec3 d, float w, float depth, float kind, float seed, out float lamp) {
  vec3 ad = vec3(d.x >= 0.0 ? max(d.x, 1e-4) : min(d.x, -1e-4), d.y >= 0.0 ? max(d.y, 1e-4) : min(d.y, -1e-4), max(d.z, 1e-4));
  vec3 bnd = vec3(ad.x > 0.0 ? 0.5 * w : -0.5 * w, ad.y > 0.0 ? 3.75 : 0.0, depth);
  vec3 t = (bnd - p) / ad;
  float tm = min(min(t.x, t.y), t.z);
  vec3 h = p + ad * tm;
  lamp = 0.0;
  // the shop's look: walls, floor, ceiling, light
  vec3 wall = vec3(0.7, 0.69, 0.65);
  vec3 floorA = vec3(0.7, 0.68, 0.64);
  vec3 floorB = vec3(0.3, 0.3, 0.3);
  vec3 light = vec3(1.0, 0.96, 0.88);
  float tile = 0.6;
  if (kind < 0.5) { // shelves: grocery, hardware, books
  } else if (kind < 1.5) { // food: counter, menu boards, warm pendants
    wall = mix(vec3(0.62, 0.5, 0.38), vec3(0.85, 0.83, 0.78), step(0.5, cHash(seed * 3.0)));
    floorA = vec3(0.55, 0.4, 0.28);
    floorB = vec3(0.42, 0.29, 0.19);
    light = vec3(1.0, 0.78, 0.5);
    tile = 0.2;
  } else if (kind < 2.5) { // boutique: white box, timber floor, spotlights
    wall = vec3(0.76, 0.75, 0.72);
    floorA = vec3(0.6, 0.47, 0.34);
    floorB = vec3(0.55, 0.43, 0.31);
    tile = 0.18;
  } else if (kind < 3.5) { // bright: pharmacy, laundromat, bank, gym
    wall = vec3(0.78, 0.82, 0.85);
    floorA = vec3(0.82);
    floorB = vec3(0.74);
    light = vec3(0.93, 0.98, 1.05);
  } else { // dim and warm: bar, wine shop, noodle house
    wall = vec3(0.32, 0.12, 0.08);
    floorA = vec3(0.24, 0.15, 0.1);
    floorB = vec3(0.2, 0.12, 0.08);
    light = vec3(1.0, 0.62, 0.34);
    tile = 0.2;
  }
  vec3 c;
  if (tm == t.z) {
    // back wall
    vec2 q = vec2(h.x + 0.5 * w, h.y);
    if (kind < 0.5 || (kind > 2.5 && kind < 3.5 && cHash(seed * 9.0) < 0.6)) c = shopShelves(q, seed, wall);
    else if (kind < 1.5 || kind > 3.5) {
      c = wall;
      // menu boards over a counter (or a back bar of bottles)
      if (kind > 3.5 && q.y > 1.2 && q.y < 2.4) {
        float b = step(0.35, fract(q.x / 0.11)) * step(0.3, fract(q.y / 0.4)) * step(fract(q.y / 0.4), 0.85);
        c = mix(vec3(0.05, 0.03, 0.02), vec3(0.95, 0.6, 0.25) * (0.6 + 0.8 * cHash(floor(q.x / 0.11) + floor(q.y / 0.4) * 7.0)), b);
        lamp += b * 0.6;
      } else if (q.y > 1.85 && q.y < 2.65 && abs(fract(q.x / 1.6) - 0.5) < 0.42) {
        float line = step(0.55, fract(q.y / 0.09)) * step(0.15, fract(q.x / 0.37 + floor(q.y / 0.09) * 0.37));
        c = mix(vec3(0.06), vec3(0.85), line * 0.6);
      }
      if (q.y < 1.05) c = q.y > 0.98 ? vec3(0.75, 0.72, 0.68) : wall * 0.45;
    } else c = shopRack(q, seed, wall) * mix(1.0, 0.8, step(0.5, fract(q.x / 3.0)));
  } else if (tm == t.y) {
    if (ad.y < 0.0) {
      // floor tiles or boards
      vec2 f = floor(h.xz / vec2(tile, tile < 0.3 ? 1.2 : tile));
      c = mix(floorA, floorB, mod(f.x + f.y * (tile < 0.3 ? 0.0 : 1.0), 2.0)) * (0.92 + 0.16 * cHash(f.x * 3.1 + f.y * 7.7));
    } else {
      // ceiling and its lights
      c = vec3(0.6);
      if (kind < 0.5 || (kind > 2.5 && kind < 3.5)) {
        float panel = step(abs(fract(h.x / 1.5) - 0.5), 0.14) * step(abs(fract(h.z / 2.2) - 0.5), 0.3);
        lamp += panel * 3.0;
      } else {
        float spot = 1.0 - smoothstep(0.05, 0.11, length(fract(h.xz / vec2(1.4, 1.8)) - 0.5));
        lamp += spot * 4.0;
      }
    }
  } else {
    // side walls: the shop's own fittings, seen at an angle
    vec2 q = vec2(h.z, h.y);
    if (kind < 0.5) c = shopShelves(q, seed + 1.0, wall);
    else if (kind > 1.5 && kind < 2.5) c = shopRack(q, seed + 1.0, wall);
    else c = q.y < 1.1 ? wall * 0.6 : wall;
  }
  // the room is brightest near its lights, dimmer at the back and in the corners
  float ao = 0.7 + 0.3 * smoothstep(0.0, 0.5, min(min(h.y, 3.75 - h.y) * 2.0, min(0.5 * w - abs(h.x), depth - h.z)));
  float fall = mix(1.0, 0.75, h.z / depth);
  return c * light * ao * fall + light * lamp;
}

// Roll-down security gate: corrugated steel, a little graffiti.
vec3 shopGate(vec2 q, float seed) {
  float rib = 0.75 + 0.25 * smoothstep(0.2, 0.5, abs(fract(q.y / 0.075) - 0.5));
  vec3 c = vec3(0.42, 0.42, 0.4) * rib;
  float tag = smoothstep(0.55, 0.62, sin(q.x * 3.1 + seed * 40.0) * sin(q.y * 2.3 + seed * 17.0) + 0.3 * sin(q.x * 9.0 + q.y * 7.0));
  return mix(c, (0.5 + 0.5 * cos(6.2831 * (seed * 5.0 + vec3(0.0, 0.33, 0.67)))) * 0.6, tag * step(0.5, cHash(seed * 21.0)));
}
`,_=`
{
  vec3 n = normalize(vCN);
  float isTop = step(0.5, n.y);
  float layer = mix(vMeta.x, vMeta.y, isTop);
  vec2 tile = uTile[int(layer + 0.5)];
  vec2 t2 = vec2(-n.z, n.x);
  float along = dot(vCW.xz, t2);
  vec2 uv;
  vec3 T;
  vec3 Bv;
  if (isTop > 0.5) {
    uv = vCW.xz / tile;
    T = vec3(1.0, 0.0, 0.0);
    Bv = vec3(0.0, 0.0, -1.0);
  } else {
    uv = vec2(along / tile.x + floor(vMeta.w * 8.0) * 0.125, (vCW.y - vMeta.z) / tile.y);
    T = vec3(t2.x, 0.0, t2.y);
    Bv = vec3(0.0, 1.0, 0.0);
  }
  vec4 tex = texture(uFacade, vec3(uv, layer));
  vec3 nr = texture(uFacadeN, vec3(uv, layer)).rgb;
  vec2 nxy = nr.rg * 2.0 - 1.0;
  vec3 nts = vec3(nxy, sqrt(max(1.0 - dot(nxy, nxy), 0.0)));
  cityNW = normalize(T * nts.x + Bv * nts.y + n * nts.z);
  cityRough = nr.b;
  float glassLayer = step(layer, 5.5) * (1.0 - isTop);
  float s = vMeta.w;
  vec3 tint = vec3(0.9 + 0.2 * cHash(s * 13.1)) * mix(vec3(1.05, 1.0, 0.94), vec3(0.95, 1.0, 1.06), cHash(s * 7.3));
  vec3 alb = tex.rgb * mix(tint, vec3(1.0), glassLayer * 0.6);
  float h = vCW.y - vMeta.z;
  cityEmit = vec3(0.0);
  float shopFront = 0.0;
  // ---------------------------------------------------------------- street level: shops
  if (isTop < 0.5 && vMeta.z < 0.5 && h < 4.75 && layer < 15.5 && vFaceW > 3.0) {
    shopFront = 1.0;
    float W = vFaceW;
    float nb = max(1.0, floor(W / 6.8 + 0.5));
    float bw = W / nb;
    float bi = min(floor(vFaceU / bw), nb - 1.0);
    float bu = vFaceU - bi * bw;
    float id = cHash(s * 97.0 + bi * 13.7);
    float pier = 0.28 + 0.3 * step(bi, 0.5) * step(bu, 1.0) + 0.3 * step(nb - 1.5, bi) * step(bw - 1.0, bu);
    float inner = bw - 2.0 * 0.28;
    float x = bu - 0.28;
    // the wall itself (piers, the band over the signs) in the building's own material, averaged
    vec3 wallC = textureLod(uFacade, vec3(uv, layer), 5.0).rgb * mix(tint, vec3(1.0), glassLayer) * 1.15;
    float signId = floor(id * ${b}.0);
    float kind = uSignKind[int(signId)];
    // a lobby every so often: a building entrance instead of a shop
    bool lobby = cHash(id * 5.3) < 0.14;
    bool closed = cHash(id * 7.9) < mix(0.06, 0.38, uNight);
    float doorAt = inner * (cHash(id * 3.7) < 0.5 ? 0.22 : 0.78);
    bool inDoor = abs(x - doorAt) < 0.58 && h < 2.6;
    vec3 trim = mix(vec3(0.05, 0.045, 0.04), vec3(0.16, 0.2, 0.17), step(0.7, cHash(id * 2.1)));
    cityNW = n;
    if (bu < pier || bu > bw - pier) {
      alb = wallC;
      cityRough = 0.85;
    } else if (h > 4.55) {
      // cornice band, shadowed underneath
      alb = wallC * (h < 4.62 ? 0.5 : 1.05);
      cityRough = 0.8;
    } else if (h > 3.62) {
      // the sign board, set in a dark frame
      vec2 sq = vec2(x / inner, (h - 3.62) / 0.93);
      if (lobby || sq.x < 0.012 || sq.x > 0.988 || sq.y < 0.06 || sq.y > 0.94) {
        alb = lobby ? wallC * 0.9 : trim;
        cityRough = 0.5;
      } else {
        float aspect = inner / 0.93;
        float su = 0.5 + (sq.x - 0.5) * aspect / 8.0;
        vec2 cell = vec2(mod(signId, 2.0), floor(signId / 2.0));
        vec2 suv = vec2((cell.x + clamp(su, 0.003, 0.997)) / 2.0, 1.0 - (cell.y + 1.0 - clamp((sq.y - 0.06) / 0.88, 0.02, 0.98)) / 16.0);
        vec3 sc = texture(uSigns, suv).rgb;
        alb = sc;
        cityRough = 0.45;
        // backlit at night (dark once the shop has closed)
        cityEmit += sc * sc * uNight * (closed ? 0.12 : 0.9);
      }
    } else {
      bool frame = false;
      float panels = max(1.0, floor(inner / 2.2 + 0.5));
      float pw = inner / panels;
      // mullions, transom bar, the head of the frame, the stall riser under the glass
      if (abs(fract(x / pw + 0.5) - 0.5) * pw < 0.045 && !inDoor) frame = true;
      if (x < 0.06 || x > inner - 0.06) frame = true;
      if (h > 3.0 && h < 3.14) frame = true;
      if (h > 3.55) frame = true;
      if (inDoor) {
        float dx = abs(x - doorAt);
        if (dx > 0.5 || h > 2.5 || (dx < 0.035 && h > 0.05) || (h > 0.95 && h < 1.03 && dx > 0.08)) frame = true;
      } else if (h < 0.5) frame = true;
      if (closed && !lobby && h < 3.0) {
        alb = shopGate(vec2(x, h), id);
        cityRough = 0.55;
      } else if (frame) {
        alb = (h < 0.5 && !inDoor) ? mix(trim, wallC, 0.5) : trim;
        cityRough = 0.35;
      } else {
        // glass: the reflection comes from the lighting; the room behind it is emitted
        alb = vec3(0.015);
        cityRough = 0.04 + 0.05 * cHash(floor(x / pw) + id);
        vec3 V = normalize(vCW - cameraPosition);
        vec3 Tn = vec3(n.z, 0.0, -n.x);
        vec3 d = vec3(dot(V, Tn), V.y, -dot(V, n));
        float depth = lobby ? 9.0 : 4.0 + 5.0 * cHash(id * 4.4);
        vec3 p = vec3(x - 0.5 * inner, h, 0.0);
        float lamp;
        vec3 room = shopInterior(p, d, inner, depth, lobby ? 2.0 : kind, id, lamp);
        if (lobby) room *= vec3(1.0, 0.92, 0.8);
        float cosV = clamp(-dot(V, n), 0.0, 1.0);
        float fres = 0.04 + 0.96 * pow(1.0 - cosV, 5.0);
        // shops read darker than the street by day, they're the brightest thing at night
        cityEmit += room * (1.0 - fres) * mix(0.11, 0.9, uNight) * (h > 3.14 ? 0.7 : 1.0);
      }
    }
  }
  // ---------------------------------------------------------------- after dark: windows upstairs
  // the windows come on one by one: warm apartments, cooler offices, a few TVs
  if (uNight > 0.001 && isTop < 0.5 && h > 4.8) {
    float cellW = mix(2.4, 1.6, glassLayer);
    vec2 wq = vec2(along / cellW, h / 3.6);
    vec2 wc = floor(wq);
    vec2 wf = fract(wq);
    // brick and stone: the photo's own glass is the window; curtain walls: mullions and slabs frame each pane
    float win = glassLayer > 0.5
      ? step(0.12, wf.x) * step(wf.x, 0.88) * step(0.22, wf.y) * step(wf.y, 0.86)
      : 1.0 - smoothstep(0.16, 0.3, cityRough);
    // offices light up in short runs along a floor
    vec2 id = glassLayer > 0.5 ? vec2(floor(wc.x / 3.0), wc.y) : wc;
    float r = cHash(id.x * 1.37 + id.y * 57.31 + s * 311.0);
    float lit = step(r, mix(0.1, mix(0.24, 0.15, glassLayer), uNight)) * win;
    vec3 warm = mix(vec3(1.0, 0.62, 0.32), vec3(1.0, 0.8, 0.56), cHash(r * 7.3));
    vec3 cool = vec3(0.72, 0.84, 1.0);
    vec3 col = mix(warm, cool, clamp(step(0.85, cHash(r * 13.1)) + glassLayer * 0.55, 0.0, 1.0));
    // TVs flicker up close; from kilometres away a pixel-sized flicker only reads as noise
    float tvNear = 1.0 - smoothstep(900.0, 2500.0, distance(cameraPosition, vCW));
    float tv = step(0.97, cHash(r * 3.7)) * (0.6 + 0.4 * sin(uTime * 6.0 + r * 40.0) * tvNear);
    col = mix(col, vec3(0.45, 0.6, 1.0), tv);
    // a lit room is brightest under its ceiling light
    float room = 0.55 + 0.45 * smoothstep(0.25, 0.8, wf.y);
    cityEmit = lit * col * room * (0.3 + 0.4 * cHash(r * 5.1)) * uNight * mix(0.7, 0.45, glassLayer);
  }
  if (shopFront < 0.5) {
    // roofs as Manhattan looks from the air: white membrane, pale pavers, grey gravel,
    // dark tar, now and then a planted roof; the photo keeps its grain at its own brightness
    // (the hero's roof is the rooftop set's floor: it keeps its dark tar)
    bool hero = abs(vCW.x - ${v.S.x.toFixed(1)}) < ${(v.S.w/2+12).toFixed(1)} && abs(vCW.z - ${v.S.z.toFixed(1)}) < ${(v.S.d/2+12).toFixed(1)};
    if (hero) alb *= mix(1.0, 0.42 + 0.35 * cHash(s * 17.3), isTop);
    else if (isTop > 0.5) {
      float rk = cHash(s * 17.3);
      float grain = dot(tex.rgb, vec3(0.3, 0.59, 0.11)) * 2.2;
      vec3 roofC = rk < 0.3 ? vec3(0.74, 0.74, 0.72)
        : rk < 0.45 ? vec3(0.52, 0.5, 0.47)
        : rk < 0.94 ? vec3(0.2, 0.19, 0.18) + 0.14 * cHash(s * 5.9)
        : vec3(0.2, 0.26, 0.15);
      alb = roofC * mix(1.0, grain, 0.45);
    }
    // brick and stone come in many colours: red, brown, buff, cream, painted white and grey
    if (isTop < 0.5 && glassLayer < 0.5) {
      float hk = cHash(s * 23.9);
      if (hk > 0.85) alb = vec3(1.2, 1.24, 1.26) * dot(alb, vec3(0.3, 0.59, 0.11));
      else alb *= hk < 0.35 ? vec3(1.0) : hk < 0.55 ? vec3(1.08, 0.86, 0.76) : hk < 0.7 ? vec3(0.72, 0.66, 0.62) : vec3(1.22, 1.17, 1.06);
    }
    // curtain-wall glass is darker than its texture photo (the sky reflection supplies the brightness)
    alb *= mix(1.0, 0.7, glassLayer);
    // ground contact grime
    alb *= mix(0.62, 1.0, smoothstep(0.0, 9.0, h + isTop * 20.0));
  }
  // curtain-wall glass is a tinted mirror: the panes (the photo's glossy parts) reflect the
  // sky and the towers around in the coating's colour; mullions and spandrels stay matte
  cityMetal = 0.0;
  // (curtain walls only: layers 4 and 5 are punched windows in a solid wall)
  if (isTop < 0.5 && layer < 3.5 && shopFront < 0.5) {
    float pane = 1.0 - smoothstep(0.15, 0.4, cityRough);
    float gk = cHash(s * 31.7);
    vec3 coat = gk < 0.4 ? vec3(0.92, 1.0, 1.1) : gk < 0.65 ? vec3(0.92, 1.06, 1.0) : gk < 0.85 ? vec3(1.0) : vec3(1.08, 0.98, 0.86);
    alb *= mix(vec3(1.0), coat, pane);
    cityMetal = pane * 0.35;
  }
  // the scan: behind its front every building turns to a wireframe of floors, bays and edges
  if (uScan.y > 0.001) {
    float isle = step(vCW.x, 1100.0);
    float done = step(uScan.x, vCW.x) * uScan.y * isle;
    float front = exp(-abs(vCW.x - uScan.x) / 3.0) * uScan.y * isle;
    float wall = 1.0 - isTop;
    // the fine floor/bay grid thins out with distance so far towers read as outlines, not sheets
    float fine = clamp(1.6 - max(fwidth(h), fwidth(vFaceU)) * 5.0, 0.0, 1.0);
    float grid = max(cityLine(h, 3.6), cityLine(vFaceU, 4.0)) * wall * fine;
    float edge = (1.0 - smoothstep(0.0, fwidth(vFaceU) * 2.0 + 0.06, min(vFaceU, vFaceW - vFaceU))) * wall;
    float roof = isTop * max(cityLine(vCW.x, 6.0), cityLine(vCW.z, 6.0)) * 0.6;
    float wire = clamp(max(grid * 0.5, max(edge, roof)), 0.0, 1.0);
    alb = mix(alb, alb * 0.05, done);
    cityMetal *= 1.0 - done;
    cityEmit = mix(cityEmit, vec3(0.0), done) + done * wire * vec3(0.2, 0.95, 1.45) * 0.9 + front * vec3(1.6, 2.4, 3.0) * 2.0;
  }
  diffuseColor.rgb *= alb;
  cityGlass = glassLayer * (1.0 - shopFront);
}
`;e.s(["f",0,function(e,t,r){let i=new a.aV({roughness:1,metalness:0}),o=v.I.map(([e,t])=>new a.wq(e,t));return i.onBeforeCompile=a=>{(0,p.Z)(a),a.uniforms.uFacade={value:e},a.uniforms.uFacadeN={value:t},a.uniforms.uTile={value:o},a.uniforms.uSigns={value:r},a.uniforms.uSignKind={value:w},a.uniforms.uNight=g.f.uNight,a.uniforms.uTime=g.f.uTime,a.uniforms.uScan=g.f.uScan,a.vertexShader=a.vertexShader.replace("#include <common>",`#include <common>
         attribute vec4 aMeta;
         attribute vec2 aFace;
         varying vec3 vCW;
         varying vec3 vCN;
         varying float vFaceU;
         flat varying float vFaceW;
         flat varying vec4 vMeta;`).replace("#include <begin_vertex>",`#include <begin_vertex>
         vCW = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vCN = normalize(mat3(modelMatrix) * normal);
         vMeta = vec4(aMeta.xyz, aMeta.w / 127.0);
         vFaceU = aFace.x * 0.05;
         vFaceW = aFace.y * 0.05;`),a.fragmentShader=a.fragmentShader.replace("#include <common>",`#include <common>
${S}`).replace("#include <map_fragment>",_).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
         roughnessFactor = mix(cityRough, cityRough * 0.55, cityGlass);`).replace("#include <metalnessmap_fragment>","#include <metalnessmap_fragment>\nmetalnessFactor = cityMetal;").replace("#include <normal_fragment_maps>","normal = normalize((viewMatrix * vec4(cityNW, 0.0)).xyz);").replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance += cityEmit;")},i.customProgramCacheKey=()=>"city-v6",i}],81556);var L=e.i(43476);let E=e=>1100>Math.abs(e)?500:1500;function A(e){let t,r=5*e.length,o=new Float32Array(4*r*3),n=new Float32Array(4*r*3),l=new Int8Array(4*r*4),s=new Uint16Array(4*r*2),c=new Uint32Array(6*r),f=0,h=0,u=(e,a,r,i,c,h,u,d)=>{let m=3*f;o[m]=e,o[m+1]=a,o[m+2]=r,n[m]=i,n[m+1]=c,n[m+2]=h;let p=4*f;l[p]=t.layer,l[p+1]=t.roof,l[p+2]=t.base,l[p+3]=Math.round(127*t.seed),s[2*f]=Math.round(20*u),s[2*f+1]=Math.round(20*d),f++},d=()=>{let e=f-4;c[h]=e,c[h+1]=e+1,c[h+2]=e+2,c[h+3]=e,c[h+4]=e+2,c[h+5]=e+3,h+=6};for(t of e){let e=t.x-t.w/2,a=t.x+t.w/2,r=t.z-t.d/2,i=t.z+t.d/2,{y0:o,y1:n,w:l,d:s}=t;u(e,o,i,0,0,1,0,l),u(a,o,i,0,0,1,l,l),u(a,n,i,0,0,1,l,l),u(e,n,i,0,0,1,0,l),d(),u(a,o,r,0,0,-1,0,l),u(e,o,r,0,0,-1,l,l),u(e,n,r,0,0,-1,l,l),u(a,n,r,0,0,-1,0,l),d(),u(a,o,i,1,0,0,0,s),u(a,o,r,1,0,0,s,s),u(a,n,r,1,0,0,s,s),u(a,n,i,1,0,0,0,s),d(),u(e,o,r,-1,0,0,0,s),u(e,o,i,-1,0,0,s,s),u(e,n,i,-1,0,0,s,s),u(e,n,r,-1,0,0,0,s),d(),u(e,n,i,0,1,0,0,0),u(a,n,i,0,1,0,0,0),u(a,n,r,0,1,0,0,0),u(e,n,r,0,1,0,0,0),d()}let m=new a.ld;return m.setAttribute("position",new a.f5(o,3)),m.setAttribute("normal",new a.f5(n,3)),m.setAttribute("aMeta",new a.f5(l,4)),m.setAttribute("aFace",new a.f5(s,2)),m.setIndex(new a.f5(c,1)),m.computeBoundingBox(),m.computeBoundingSphere(),(0,i.m)(m),m}e.s(["f",0,function({boxes:e,material:a}){let r=(0,t.useMemo)(()=>{let t=new Map;for(let a of e){let e=E(a.x),r=`${e}:${Math.floor(a.x/e)},${Math.floor(a.z/e)}`,i=t.get(r);i||t.set(r,i=[]),i.push(a)}return[...t.values()].map(A)},[e]),g=(0,t.useRef)(null);(0,uF.f)(({camera:e})=>{let t=g.current;if(!t)return;let a=e.position.z,r=e.position.y;if(r>1200){for(let e of t.children)!e.visible&&(e.visible=!0);return}for(let i of t.children){let t=i.geometry?.boundingSphere;if(!t)continue;let o=e.position.distanceTo(t.center),n=!(t.center.z>a+t.radius+250)&&o<3200;i.visible!==n&&(i.visible=n)}});return(0,L.jsx)("group",{ref:g,children:r.map((e,t)=>(0,L.jsx)("mesh",{geometry:e,material:a,castShadow:!1,receiveShadow:!1},t))})}],94172);let C=new Set,D=!1;function z(e,t,a=2){let r=t&&t.length,i=r?t[0]*a:e.length;C.size&&C.clear();let o=k(e,0,i,a,!0),n=[];if(!o||o.next===o.prev)return n;let l=0,s=0,c=0;if(r&&(o=function(e,t,a,r){var i;let o,n=[];for(let a=0,i=t.length;a<i;a++){let o=t[a]*r,l=a<i-1?t[a+1]*r:e.length,s=k(e,o,l,r,!1);s===s.next&&C.add(s),n.push(function(e){let t=e,a=e;do(t.x<a.x||t.x===a.x&&t.y<a.y)&&(a=t),t=t.next;while(t!==e)return a}(s))}n.sort(N),o=Math.ceil((e.length/r+2*(i=t.length))/16)+i+2,F.length<4*o&&(F=new Float64Array(4*o)),P=0,U(a,a),T=!0;for(let e=0;e<n.length;e++)a=function(e,t){let a=function(e,t){let a,r=t,i=e.x,o=e.y,n=-1/0;if(Q(e,r))return r;for(let t=0,l=0;t<P;t++,l+=4){if(o<F[l+1]||o>F[l+3]||F[l]>i||F[l+2]<=n)continue;let s=H(t);r=j(t);do{if(r.prev.next===r){if(Q(e,r.next))return r.next;else if(o<=r.y&&o>=r.next.y&&r.next.y!==r.y){let e=r.x+(o-r.y)*(r.next.x-r.x)/(r.next.y-r.y);if(e<=i&&e>n&&(n=e,a=r.x<r.next.x?r:r.next,e===i))return a}}r=r.next}while(r!==s)}if(!a)return null;let l=a.x,s=a.y,c=Math.min(o,s),f=Math.max(o,s),h=1/0;for(let t=0,m=0;t<P;t++,m+=4){if(F[m+2]<l||F[m]>i||F[m+3]<c||F[m+1]>f)continue;let p=H(t);r=j(t);do{if(r.prev.next===r&&i>=r.x&&r.x>=l&&i!==r.x&&Z(o<s?i:n,o,l,s,o<s?n:i,o,r.x,r.y)){var u,d;let t=Math.abs(o-r.y)/(i-r.x);(ee(r,e)||r.y===o&&r.next.y===o&&r.next.x>i)&&(t<h||t===h&&(r.x>a.x||r.x===a.x&&(u=a,d=r,0>X(u.prev,u,d.prev)&&0>X(d.next,u,u.next))))&&(a=r,h=t)}r=r.next}while(r!==p)}return a}(e,t);if(!a)return t;let r=et(a,e);return U(a,r.next.next),R(r,r.next),R(a,a.next)}(n[e],a);return T=!1,R(a)}(e,t,o,a)),e.length>80*a){l=e[0],s=e[1];let t=l,r=s;for(let o=a;o<i;o+=a){let a=e[o],i=e[o+1];a<l&&(l=a),i<s&&(s=i),a>t&&(t=a),i>r&&(r=i)}c=0!==(c=Math.max(t-l,r-s))?32767/c:0}return function e(t,a,r,i,o){o&&function(e,t,a,r){let i=e,o=0;do i.z=K(i.x,i.y,t,a,r),W[o++]=i,i=i.next;while(i!==e)!function(e){if(e<=32){for(let t=1;t<e;t++){let e=W[t],a=e.z,r=t-1;for(;r>=0&&W[r].z>a;)W[r+1]=W[r],r--;W[r+1]=e}return}G.length<e&&(G=new Uint32Array(e),q=new Uint32Array(e),O=Array(e));for(let t=0;t<e;t++)G[t]=W[t].z;V(e,W,G,O,q,0),V(e,O,q,W,G,8),V(e,W,G,O,q,16),V(e,O,q,W,G,24)}(o);let n=null;for(let e=0;e<o;e++){let t=W[e];t.prevZ=n,n&&(n.nextZ=t),n=t}n.nextZ=null,W.fill(null,0,o),O.fill(null,0,o)}(t,r,i,o);let n=t,l=!1;for(;t.prev!==t.next;){let s=t.prev,c=t.next;if(0>X(s,t,c)&&(o?function(e,t,a,r){let i=e.prev,o=e.next,n=i.x,l=e.x,s=o.x,c=i.y,f=e.y,h=o.y,u=Math.min(n,l,s),d=Math.min(c,f,h),m=Math.max(n,l,s),p=Math.max(c,f,h),g=K(u,d,t,a,r),v=K(m,p,t,a,r),x=e.prevZ;for(;x&&x.z>=g;){if(x.x>=u&&x.x<=m&&x.y>=d&&x.y<=p&&x!==o&&(n!==x.x||c!==x.y)&&Z(n,c,l,f,s,h,x.x,x.y)&&X(x.prev,x,x.next)>=0)return!1;x=x.prevZ}let y=e.nextZ;for(;y&&y.z<=v;){if(y.x>=u&&y.x<=m&&y.y>=d&&y.y<=p&&y!==o&&(n!==y.x||c!==y.y)&&Z(n,c,l,f,s,h,y.x,y.y)&&X(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}(t,r,i,o):function(e){let t=e.prev,a=e.next,r=t.x,i=e.x,o=a.x,n=t.y,l=e.y,s=a.y,c=Math.min(r,i,o),f=Math.min(n,l,s),h=Math.max(r,i,o),u=Math.max(n,l,s),d=a.next;for(;d!==t;){if(d.x>=c&&d.x<=h&&d.y>=f&&d.y<=u&&(r!==d.x||n!==d.y)&&Z(r,n,i,l,o,s,d.x,d.y)&&X(d.prev,d,d.next)>=0)return!1;d=d.next}return!0}(t))){a.push(s.i,t.i,c.i),er(t),t=c,n=c;continue}if((t=c)===n){if(D=!1,t=R(t),D){n=t;continue}if(!l){n=t=function(e,t){let a=e,r=!1;do{let i=a.prev,o=a.next.next;Y(i,a,a.next,o,!1)&&ee(i,o)&&ee(o,i)&&(t.push(i.i,a.i,o.i),er(a),er(a.next),a=e=o,r=!0),a=a.next}while(a!==e)return r?R(a):a}(t,a),l=!0;continue}!function(t,a,r,i,o){let n=t;do{let t=n.next.next;for(;t!==n.prev;){if(n.i!==t.i&&function(e,t){let a=Q(e,t)&&X(e.prev,e,e.next)>0&&X(t.prev,t,t.next)>0;return e.next.i!==t.i&&(a||ee(e,t)&&ee(t,e)&&(0!==X(e.prev,e,t.prev)||0!==X(e,t.prev,t)))&&!function(e,t){let a=Math.min(e.x,t.x),r=Math.max(e.x,t.x),i=Math.min(e.y,t.y),o=Math.max(e.y,t.y),n=e;do{let l=n.next;if(n.x>r&&l.x>r||n.x<a&&l.x<a||n.y>o&&l.y>o||n.y<i&&l.y<i){n=l;continue}if(n.i!==e.i&&l.i!==e.i&&n.i!==t.i&&l.i!==t.i&&Y(n,l,e,t))return!0;n=l}while(n!==e)return!1}(e,t)&&(a||function(e,t){let a=e,r=!1,i=(e.x+t.x)/2,o=(e.y+t.y)/2;do{let e=a.next;a.y>o!=e.y>o&&i<(e.x-a.x)*(o-a.y)/(e.y-a.y)+a.x&&(r=!r),a=e}while(a!==e)return r}(e,t))}(n,t)){let l=et(n,t);n=R(n,n.next),l=R(l,l.next),e(n,a,r,i,o),e(l,a,r,i,o);return}t=t.next}n=n.next}while(n!==t)}(t,a,r,i,o);break}}}(o,n,l,s,c),n}function k(e,t,a,r,i){let o=null;if(i===function(e,t,a,r){let i=0;for(let o=t,n=a-r;o<a;o+=r)i+=(e[n]-e[o])*(e[o+1]+e[n+1]),n=o;return i}(e,t,a,r)>0)for(let i=t;i<a;i+=r)o=ea(i/r|0,e[i],e[i+1],o);else for(let i=a-r;i>=t;i-=r)o=ea(i/r|0,e[i],e[i+1],o);return o&&Q(o,o.next)&&(er(o),o=o.next),o}function R(e,t=e){let a=t===e,r=e,i;do i=!1,r!==r.next&&(0===C.size||!C.has(r))&&(Q(r,r.next)||0===X(r.prev,r,r.next))?((a||r===t)&&(t=r.prev),D=!0,er(r),r=r.prev,i=!0):(a||r!==t)&&(r=r.next,i=!a);while(i||r!==t)return t}let T=!1;function N(e,t){return e.x-t.x||e.y-t.y||(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x)}let F=new Float64Array(0),P=0,I=[],B=[];function U(e,t){let a=e;do{let e=P++;I[e]=a;let r=a.x,i=a.y,o=a.x,n=a.y,l=0;do{let t=a.next;a.z=e,t.x<r&&(r=t.x),t.x>o&&(o=t.x),t.y<i&&(i=t.y),t.y>n&&(n=t.y),a=t}while(++l<16&&a!==t)B[e]=a;let s=4*e;F[s]=r,F[s+1]=i,F[s+2]=o,F[s+3]=n}while(a!==t)}function H(e){let t=B[e];for(;t.prev.next!==t;)t=t.next;return B[e]=t,t}function j(e){let t=I[e];for(;t.prev.next!==t;)t=t.next;return I[e]=t,t}let W=[],O=[],G=new Uint32Array(0),q=new Uint32Array(0),$=new Uint32Array(256);function V(e,t,a,r,i,o){$.fill(0);for(let t=0;t<e;t++)$[a[t]>>>o&255]++;let n=0;for(let e=0;e<256;e++){let t=$[e];$[e]=n,n+=t}for(let n=0;n<e;n++){let e=a[n],l=$[e>>>o&255]++;r[l]=t[n],i[l]=e}}function K(e,t,a,r,i){return(e=((e=((e=((e=((e=(e-a)*i|0)|e<<8)&0xff00ff)|e<<4)&0xf0f0f0f)|e<<2)&0x33333333)|e<<1)&0x55555555)|(t=((t=((t=((t=((t=(t-r)*i|0)|t<<8)&0xff00ff)|t<<4)&0xf0f0f0f)|t<<2)&0x33333333)|t<<1)&0x55555555)<<1}function Z(e,t,a,r,i,o,n,l){return(i-n)*(t-l)>=(e-n)*(o-l)&&(e-n)*(r-l)>=(a-n)*(t-l)&&(a-n)*(o-l)>=(i-n)*(r-l)}function X(e,t,a){return(t.y-e.y)*(a.x-t.x)-(t.x-e.x)*(a.y-t.y)}function Q(e,t){return e.x===t.x&&e.y===t.y}function Y(e,t,a,r,i=!0){let o=X(e,t,a),n=X(e,t,r),l=X(a,r,e),s=X(a,r,t);return(o>0&&n<0||o<0&&n>0)&&(l>0&&s<0||l<0&&s>0)||!!i&&!!(0===o&&J(e,a,t)||0===n&&J(e,r,t)||0===l&&J(a,e,r)||0===s&&J(a,t,r))}function J(e,t,a){return t.x<=Math.max(e.x,a.x)&&t.x>=Math.min(e.x,a.x)&&t.y<=Math.max(e.y,a.y)&&t.y>=Math.min(e.y,a.y)}function ee(e,t){return 0>X(e.prev,e,e.next)?X(e,t,e.next)>=0&&X(e,e.prev,t)>=0:0>X(e,t,e.prev)||0>X(e,e.next,t)}function et(e,t){let a=ei(e.i,e.x,e.y),r=ei(t.i,t.x,t.y),i=e.next,o=t.prev;return e.next=t,t.prev=e,a.next=i,i.prev=a,r.next=a,a.prev=r,o.next=r,r.prev=o,r}function ea(e,t,a,r){let i=ei(e,t,a);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function er(e){var t,a;let r;e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ),T&&(t=e.prev,a=e.next,r=4*t.z,a.x<F[r]&&(F[r]=a.x),a.y<F[r+1]&&(F[r+1]=a.y),a.x>F[r+2]&&(F[r+2]=a.x),a.y>F[r+3]&&(F[r+3]=a.y))}function ei(e,t,a){return{i:e,x:t,y:a,prev:null,next:null,z:0,prevZ:null,nextZ:null}}e.s(["f",0,z],54008);var eo=e.i(19328);let en={float32:Float32Array,uint8:Uint8Array,uint16:Uint16Array,uint32:Uint32Array};function el(e,t){let a={};for(let r of t)a[r.name]=new en[r.dtype](e,r.offset,r.length);return a}async function es(e){let t=await fetch(e);if(!t.ok)throw Error(`${e}: ${t.status}`);return t.arrayBuffer()}async function ec(){let e=await (await fetch("/city/city.json")).json(),[t,a,r,i]=await Promise.all([es("/city/buildings.bin"),es("/city/ground.bin"),es("/city/mask.bin"),e.waterfront?es("/city/waterfront.bin"):Promise.resolve(null)]),o=i&&e.waterfront?el(i,e.waterfront.arrays):null,n=el(t,e.buildings.arrays),l=el(a,e.ground.arrays),s=el(r,e.mask.arrays),{width:c,height:f}=e.mask,h=new Uint8Array(c*f),u=0;for(let e=0;e<f;e++){let t=e*c;for(let a=0;a<s.rowRuns[e];a++,u++)h.fill(s.val[u],t,t+s.len[u]),t+=s.len[u]}return(0,eo.C)({cls:h,width:c,height:f,cell:e.mask.cell,x0:e.mask.x0,z0:e.mask.z0}),{window:e.window,buildings:{count:e.buildings.count,h:n.h,year:n.year,kind:n.kind,style:n.style,seed:n.seed,src:n.src,polys:{count:n.ringCount,len:n.ringLen,xy:n.xy},names:e.buildings.names},ground:{land:{count:l.landRingCount,len:l.landRingLen,xy:l.landXy},paved:{count:l.pavedRingCount,len:l.pavedRingLen,xy:l.pavedXy},park:{count:l.parkRingCount,len:l.parkRingLen,xy:l.parkXy}},mask:{...e.mask,cls:h},waterfront:o?{wall:o.wall,kind:o.wallKind}:null}}let ef=null,eh=()=>ef??=ec();function eu(e,t){let a=0,r=0;for(let i=0;i<e.count.length;i++){t(i,r,e.count[i],a);for(let t=0;t<e.count[i];t++)r+=e.len[a+t];a+=e.count[i]}}let ed=(e,t)=>e>-1100&&e<900&&t>-3300&&t<800;function em(e,t=()=>!1,r=450){let o=e.buildings,n=o.polys,l=new Map;eu(n,(e,a,i,s)=>{let c=n.len[s];if(c<3)return;let f=0,h=0;for(let e=0;e<c;e++)f+=n.xy[(a+e)*2],h+=n.xy[(a+e)*2+1];if(t(e,f/=c,h/=c,o.h[e]))return;let u=4096*Math.floor(f/r)+Math.floor(h/r),d=l.get(u);d||l.set(u,d=[]),d.push({b:e,first:a,rings:i,ringBase:s,cx:f,cz:h})});let s=[];for(let e of l.values()){let t=0,r=0;for(let a of e)for(let e=0;e<a.rings;e++)t+=n.len[a.ringBase+e];let l=[];for(let t of e){let e=function(e,t,a,r){let i=[],o=[],n=t;for(let t=0;t<a;t++){let a=e.len[r+t];t>0&&o.push(i.length/2);for(let t=0;t<a;t++)i.push(e.xy[(n+t)*2],e.xy[(n+t)*2+1]);n+=a}return{pts:i,idx:z(i,o,2)}}(n,t.first,t.rings,t.ringBase);l.push({b:t.b,pts:e.pts,idx:e.idx}),r+=e.pts.length/2}let c=e.map(e=>(function(e,t,a,r){let i=[];if(e<9||!r)return i;if((0!==t||e<80)&&(i.push([e-1,e,.55]),e>14&&i.push([e-1.7,e-1,.25])),r&&e<160&&(0!==t||a>0&&a<1945)){i.push([4.8,5.2,.22]);for(let t=14.4;t<e-4;t+=14.4)i.push([t,t+.4,.18])}return i})(Math.max(o.h[e.b],3),o.style[e.b],o.year[e.b],ed(e.cx,e.cz))),f=0;e.forEach((e,t)=>{let a=0;for(let t=0;t<e.rings;t++)a+=n.len[e.ringBase+t];f+=a*c[t].length});let h=4*t+r+12*f,u=new Float32Array(3*h),d=new Int8Array(3*h),m=new Int8Array(4*h),p=new Uint16Array(2*h),g=0;for(let e of l)g+=e.idx.length/3;let x=h<65536?new Uint16Array(6*t+3*g+18*f):new Uint32Array(6*t+3*g+18*f),y=0,w=0,b=1/0,M=1/0,S=1/0,_=-1/0,L=-1/0,E=-1/0,A=(e,t,a,r,i,o,n,l,s,c,f)=>{let h=3*y;u[h]=e,u[h+1]=t,u[h+2]=a,d[h]=o,d[h+1]=n,d[h+2]=l,m[4*y]=s,m[4*y+1]=c,m[4*y+3]=f,p[2*y]=r,p[2*y+1]=i;let g=Math.fround(e),v=Math.fround(t),x=Math.fround(a);return g<b&&(b=g),g>_&&(_=g),v<M&&(M=v),v>L&&(L=v),x<S&&(S=x),x>E&&(E=x),y++},C=(e,t,a,r,i,o,n,l,s,c,f,h,u,d,m,p,g)=>{let y=A(e+l,n,t+s,0,i,u,d,m,p,v.L.concrete,o);A(a+l,n,r+s,i,i,u,d,m,p,v.L.concrete,o),A(a+f,c,r+h,i,i,u,d,m,p,v.L.concrete,o),A(e+f,c,t+h,0,i,u,d,m,p,v.L.concrete,o),g?(x[w++]=y,x[w++]=y+2,x[w++]=y+1,x[w++]=y,x[w++]=y+3,x[w++]=y+2):(x[w++]=y,x[w++]=y+1,x[w++]=y+2,x[w++]=y,x[w++]=y+2,x[w++]=y+3)};e.forEach((e,a)=>{let r=e.b,i=Math.max(o.h[r],3),s=o.seed[r]/255,f=o.style[r],h=(e=>e[o.seed[r]%e.length])(0===f?v.L.glass:1===f?v.L.brick:v.L.stone),u=i>60?v.L.concrete:v.L.gravel,d=Math.round(127*s),m=e.first;for(let r=0;r<e.rings;r++){let o=n.len[e.ringBase+r],l=function(e,t,a){let r=0;for(let i=0;i<a;i++){let o=(i+1)%a;r+=e[(t+i)*2]*e[(t+o)*2+1]-e[(t+o)*2]*e[(t+i)*2+1]}return r/2}(n.xy,m,o),s=0===r?l>0:l<0,f=e=>s?m+(o-e)%o:m+e;for(let e=0;e<o;e++){let r=f(e),l=f((e+1)%o),s=n.xy[2*r],m=n.xy[2*r+1],p=n.xy[2*l],g=n.xy[2*l+1],y=p-s,b=g-m,M=Math.hypot(y,b);if(M<.05){t--;continue}let S=Math.round(-b/M*127),_=Math.round(y/M*127),L=Math.min(65535,Math.round(20*M)),E=A(s,0,m,0,L,S,0,_,h,u,d);for(let[e,t,r]of(A(p,0,g,L,L,S,0,_,h,u,d),A(p,i,g,L,L,S,0,_,h,u,d),A(s,i,m,0,L,S,0,_,h,u,d),x[w++]=E,x[w++]=E+1,x[w++]=E+2,x[w++]=E,x[w++]=E+2,x[w++]=E+3,c[a])){if(t>i+.01)continue;let a=y/M,o=b/M,n=S/127*r,l=_/127*r,c=s-a*r,f=m-o*r,u=p+a*r,x=g+o*r;C(c,f,u,x,L,d,e,n,l,t,n,l,S,0,_,h,!1),C(c,f,u,x,L,d,t,0,0,t,n,l,0,127,0,h,!0),C(c,f,u,x,L,d,e,0,0,e,n,l,0,-127,0,v.L.concrete,!1)}}m+=o}let p=l[a],g=y;for(let e=0;e<p.pts.length;e+=2)A(p.pts[e],i,p.pts[e+1],0,0,0,127,0,h,u,d);for(let e=0;e<p.idx.length;e+=3){let t=p.idx[e],a=p.idx[e+1],r=p.idx[e+2],i=(p.pts[2*a+1]-p.pts[2*t+1])*(p.pts[2*r]-p.pts[2*t])-(p.pts[2*a]-p.pts[2*t])*(p.pts[2*r+1]-p.pts[2*t+1]);x[w++]=g+t,x[w++]=g+(i>0?a:r),x[w++]=g+(i>0?r:a)}});let D=new a.ld;D.setAttribute("position",new a.f5(u.subarray(0,3*y),3)),D.setAttribute("normal",new a.f5(d.subarray(0,3*y),3,!0)),D.setAttribute("aMeta",new a.f5(m.subarray(0,4*y),4)),D.setAttribute("aFace",new a.f5(p.subarray(0,2*y),2)),D.setIndex(new a.f5(x.subarray(0,w),1)),D.boundingBox=new a.VQ(new a.cE(b,M,S),new a.cE(_,L,E)),D.boundingSphere=D.boundingBox.getBoundingSphere(new a.L0),(0,i.m)(D),s.push(D)}return s}e.s(["R",0,em,"$",0,eu,"x",0,ed,"Y",0,eh,"G",0,()=>(0,t.use)(eh())],38376),e.s(["f",0,function({city:e,material:a,skip:r}){let i=(0,t.useMemo)(()=>em(e,r),[e,r]),g=(0,t.useRef)(null);(0,uF.f)(({camera:e})=>{let t=g.current;if(!t)return;let a=e.position.z,r=e.position.y;if(r>1200){for(let e of t.children)!e.visible&&(e.visible=!0);return}for(let o of t.children){let t=o.geometry?.boundingSphere;if(!t)continue;let i=e.position.distanceTo(t.center),n=!(t.center.z>a+t.radius+250)&&i<3200;o.visible!==n&&(o.visible=n)}});return(0,L.jsx)("group",{ref:g,children:i.map((e,t)=>(0,L.jsx)("mesh",{geometry:e,material:a,castShadow:!1,receiveShadow:!1},t))})}],27391)},17829,78176,e=>{var t=e.i(90072);e.i(75152);var a=e.i(33119);let r=[[0,96,2.6,9e-5,1,.35],[.058,96,3.4,9e-5,1,.35],[.064,98,8,7e-5,1,.35],[.1,103,11,65e-6,.95,.35],[.16,108,15,7e-5,.92,.3],[.24,122,26,9e-5,.9,.25],[.33,150,40,11e-5,.88,.2],[.4,205,42,11e-5,.88,.25],[.432,240,20,12e-5,.92,.3],[.452,252,8.5,13e-5,1,.35],[.56,257,4.5,14e-5,1.05,.35],[.6,260,1.4,16e-5,1.15,.35],[.64,262,-1.2,18e-5,1.25,.3],[.7,265,-4.5,18e-5,1.35,.25],[.745,268,-9,16e-5,1.3,.15],[.79,270,-17,14e-5,1.15,.1],[.9,272,-18,12e-5,1.1,.1]],i=[1,2,3,4,5].map(e=>(0,a.v)(r.map(t=>[t[0],t[e]]),!1)),o={sunDir:new t.cE(0,1,0),moonDir:new t.cE(.35,.55,-.75).normalize(),azim:0,elev:0,fogDensity:15e-5,exposure:1,cirrus:.3,night:0,studio:0},n=Math.PI/180;e.s(["_",0,o,"F",0,function(e){return o.azim=i[0](e),o.elev=i[1](e),o.fogDensity=i[2](e),o.exposure=i[3](e),o.cirrus=i[4](e),!function(e,a,r=new t.cE){let i=e*n,o=a*n;r.set(Math.sin(i)*Math.cos(o),Math.sin(o),-Math.cos(i)*Math.cos(o)).normalize()}(o.azim,o.elev,o.sunDir),o.night=t.rB.smoothstep(-o.elev,-1,12),o.studio=t.rB.smoothstep(e,.93,.948),o}],17829);let l=[55e-7,13e-6,224e-7],s=[65e-8,188e-8,85e-9],c=`
#define ATMO_PI 3.14159265
const float R_PLANET = 6371000.0;
const float R_ATMOS = 6471000.0;
const vec3 K_RLH = vec3(${l.map(e=>e.toExponential(3)).join(", ")});
const float K_MIE = 2.100e-5;
const vec3 K_OZONE = vec3(${s.map(e=>e.toExponential(3)).join(", ")});
const float SH_RLH = 8000.0;
const float SH_MIE = 1200.0;
const float MIE_G = 0.760;
// ozone rides on the Rayleigh profile here, so keep it light: it only cools the zenith at dusk
const float OZONE = 0.80;

vec2 atmoRsi(vec3 r0, vec3 rd, float sr) {
  float b = 2.0 * dot(rd, r0);
  float c = dot(r0, r0) - sr * sr;
  float d = b * b - 4.0 * c;
  if (d < 0.0) return vec2(1e9, -1e9);
  d = sqrt(d);
  return vec2((-b - d) * 0.5, (-b + d) * 0.5);
}

vec3 atmoExtinction(float odR, float odM) {
  return exp(-(K_MIE * 1.1 * odM + (K_RLH + K_OZONE * OZONE) * odR));
}

/** in-scattered radiance along ray rd from a camera at altitude alt (m) */
vec3 atmosphere(vec3 rd, float alt, vec3 sunDir, float sunI, int iSteps, int jSteps) {
  vec3 r0 = vec3(0.0, R_PLANET + max(alt, 1.0), 0.0);
  vec2 p = atmoRsi(r0, rd, R_ATMOS);
  if (p.x > p.y) return vec3(0.0);
  p.x = max(p.x, 0.0);
  vec2 pg = atmoRsi(r0, rd, R_PLANET);
  if (pg.x > 0.0) p.y = min(p.y, pg.x);
  float iStep = (p.y - p.x) / float(iSteps);
  float iTime = p.x;
  vec3 totR = vec3(0.0);
  vec3 totM = vec3(0.0);
  float odR = 0.0;
  float odM = 0.0;
  float mu = dot(rd, sunDir);
  float mumu = mu * mu;
  float gg = MIE_G * MIE_G;
  float pR = 3.0 / (16.0 * ATMO_PI) * (1.0 + mumu);
  float pM = 3.0 / (8.0 * ATMO_PI) * ((1.0 - gg) * (mumu + 1.0)) / (pow(1.0 + gg - 2.0 * mu * MIE_G, 1.5) * (2.0 + gg));
  for (int i = 0; i < 24; i++) {
    if (i >= iSteps) break;
    vec3 iPos = r0 + rd * (iTime + iStep * 0.5);
    float h = length(iPos) - R_PLANET;
    float sR = exp(-h / SH_RLH) * iStep;
    float sM = exp(-h / SH_MIE) * iStep;
    odR += sR;
    odM += sM;
    // light blocked by the planet: night side
    vec2 lp = atmoRsi(iPos, sunDir, R_PLANET);
    if (lp.x < 0.0 || lp.y < 0.0) {
      float jStep = atmoRsi(iPos, sunDir, R_ATMOS).y / float(jSteps);
      float jTime = 0.0;
      float jR = 0.0;
      float jM = 0.0;
      for (int j = 0; j < 12; j++) {
        if (j >= jSteps) break;
        vec3 jPos = iPos + sunDir * (jTime + jStep * 0.5);
        float jh = length(jPos) - R_PLANET;
        jR += exp(-jh / SH_RLH) * jStep;
        jM += exp(-jh / SH_MIE) * jStep;
        jTime += jStep;
      }
      vec3 attn = atmoExtinction(odR + jR, odM + jM);
      totR += sR * attn;
      totM += sM * attn;
    }
    iTime += iStep;
  }
  return sunI * (pR * K_RLH * totR + pM * K_MIE * totM);
}

/** transmittance from a camera at altitude alt toward direction rd (to space) */
vec3 atmoTransmittance(vec3 rd, float alt) {
  vec3 r0 = vec3(0.0, R_PLANET + max(alt, 1.0), 0.0);
  vec2 pg = atmoRsi(r0, rd, R_PLANET);
  if (pg.x > 0.0) return vec3(0.0);
  float len = atmoRsi(r0, rd, R_ATMOS).y;
  float st = len / 12.0;
  float odR = 0.0;
  float odM = 0.0;
  for (int i = 0; i < 12; i++) {
    vec3 q = r0 + rd * (st * (float(i) + 0.5));
    float h = length(q) - R_PLANET;
    odR += exp(-h / SH_RLH) * st;
    odM += exp(-h / SH_MIE) * st;
  }
  return atmoExtinction(odR, odM);
}
`;function f(e,t,a){let r=2*t.dot(e),i=r*r-4*(e.dot(e)-a*a);return i<0?[1e9,-1e9]:[(-r-(i=Math.sqrt(i)))*.5,(-r+i)*.5]}let h=new t.cE,u=new t.cE,d=new t.cE;function m(e,t,a){for(let r=0;r<3;r++)a[r]=Math.exp(-(231e-7*t+(l[r]+.8*s[r])*e));return a}let p=[0,0,0];e.s(["U",0,c,"b",0,function(e,a,r,i,o=new t.Es,n=12,s=6){h.set(0,6371e3+Math.max(a,1),0);let c=f(h,e,6471e3);if(c[0]>c[1])return o.setRGB(0,0,0);c[0]=Math.max(c[0],0);let g=f(h,e,6371e3);g[0]>0&&(c[1]=Math.min(c[1],g[0]));let v=(c[1]-c[0])/n,x=c[0],y=[0,0,0],w=[0,0,0],b=0,M=0,S=e.dot(r),_=3/(16*Math.PI)*(1+S*S),L=3/(8*Math.PI)*(.4224*(S*S+1))/(2.5776*Math.pow(1.5776-2*S*.76,1.5));for(let t=0;t<n;t++){u.copy(h).addScaledVector(e,x+.5*v);let t=u.length()-6371e3,a=Math.exp(-t/8e3)*v,i=Math.exp(-t/1200)*v;b+=a,M+=i;let o=f(u,r,6371e3);if(o[0]<0||o[1]<0){let e=f(u,r,6471e3)[1]/s,t=0,o=0,n=0;for(let a=0;a<s;a++){d.copy(u).addScaledVector(r,t+.5*e);let a=d.length()-6371e3;o+=Math.exp(-a/8e3)*e,n+=Math.exp(-a/1200)*e,t+=e}m(b+o,M+n,p);for(let e=0;e<3;e++)y[e]+=a*p[e],w[e]+=i*p[e]}x+=v}return o.setRGB(i*(_*l[0]*y[0]+21e-6*L*w[0]),i*(_*l[1]*y[1]+21e-6*L*w[1]),i*(_*l[2]*y[2]+21e-6*L*w[2]))},"i",0,function(e,a,r=new t.Es){if(h.set(0,6371e3+Math.max(a,1),0),f(h,e,6371e3)[0]>0)return r.setRGB(0,0,0);let i=f(h,e,6471e3)[1]/16,o=0,n=0;for(let t=0;t<16;t++){d.copy(h).addScaledVector(e,i*(t+.5));let a=d.length()-6371e3;o+=Math.exp(-a/8e3)*i,n+=Math.exp(-a/1200)*i}return m(o,n,p),r.setRGB(p[0],p[1],p[2])}],78176)},35979,66426,e=>{e.i(43476),e.i(71645),e.i(98903),e.i(38408);var t=e.i(90072),a=e.i(78785),r=e.i(27225),i=e.i(75152),o=e.i(13003);e.i(8175),e.i(99372),e.i(50738),(0,e.i(18456).D)("space","/models/telescope.glb"),t.rB.degToRad(28),e.i(63219),e.i(40126);var n=e.i(55851);let l=e=>{let t=e.toUpperCase().slice(0,20),a=Math.floor((20-t.length)/2);return" ".repeat(a)+t+" ".repeat(20-t.length-a)},[s,c,f,h]=o.M.roles,[u,d]=o.M.tagline.split(/(?<=\.)\s+/);[[o.M.name,s,c,`${f} \xb7 ${h}`],[u,d??"",o.M.handles.dev.label,o.M.handles.film.label]].map(e=>e.map(l).join(""));var m=e.i(42463);let p=new t.cE(.82,.16,-.55).normalize(),g=i.W.earth.clone().normalize(),v=(()=>{let e=g.clone().negate(),a=new t.cE;for(let t=0;t<=1&&(a.copy(e).lerp(p,t).normalize(),!(a.dot(p)>.05));t+=.01);return a})(),x=i.W.earth.clone().addScaledVector(v,1.002*i.W.earthRadius),y=(()=>{let e=(0,n.f)(1969),t=[[-60,-110,26,3.2],[95,-240,48,6],[-180,-380,70,9],[40,-60,9,1],[-35,-45,6,.7],[210,-90,30,3]];for(let a=0;a<90;a++){let a=7*Math.pow(1-.985*e(),-.62);if(a>190)continue;let r=e()*Math.PI*2,i=55+2600*Math.pow(e(),.7),o=a*(.22-Math.min(.14,a/900))*(.6+.5*e());t.push([Math.cos(r)*i,-12+Math.sin(r)*i,a,o])}return t})(),w=Float64Array.from(y.flat());new t.cE(-1.2,function(){let e=-1.2,a=-9,r=t.rB.smoothstep(Math.sqrt(e*e+a*a),16,40),i=Math.sin(-.011*1.2)*Math.cos(-.009*14.5)*2.2+.9*Math.sin(-.0372+-.017*14.5);for(let e=0;e<w.length;e+=4){let t=-1.2-w[e],a=-14.5-w[e+1],r=Math.sqrt(t*t+a*a)/w[e+2],o=w[e+3];r<1&&(i-=o*(1-r*r)),r>=.8&&r<1.5&&(i+=.35*o*Math.sin((r-.8)/.7*Math.PI))}return(i-=31.69/3474e3*18)*r}(),-14),(0,m.I)("space",["/textures/moon/regolith_c.jpg","/textures/moon/regolith_nr.jpg","/textures/moon/grey_c.jpg","/textures/moon/grey_nr.jpg","/textures/moon/prints_c.jpg","/textures/moon/prints_nr.jpg","/textures/earth/day.jpg","/textures/earth/night.jpg","/textures/earth/clouds.jpg","/textures/earth/spec.jpg","/textures/earth/normal.jpg"]),e.s(["B",0,x,"m",0,p],35979);var b=e.i(33623);let M={bias:1,strength:.7,auto:1,grade:1},S=a.u?60:4,_=`
uniform sampler2D inputBuffer;
uniform vec2 texel;
varying vec2 vUv;
void main() {
  float acc = 0.0;
  for (int y = -1; y <= 1; y++)
    for (int x = -1; x <= 1; x++) {
      vec3 c = texture2D(inputBuffer, vUv + vec2(float(x), float(y)) * texel).rgb;
      acc += log2(dot(c, vec3(0.2126, 0.7152, 0.0722)) + 1e-4);
    }
  // encode log2 luminance (-10..+10 stops) in 8 bits
  gl_FragColor = vec4(clamp(acc / 9.0 / 20.0 + 0.5, 0.0, 1.0), 0.0, 0.0, 1.0);
}`;class L extends b.${target=new t.qL(64,36,{type:t.Zi,format:t.W1,depthBuffer:!1});pixels=new Uint8Array(9216);pending=!1;frame=0;metered=1;last=performance.now();mat;constructor(){super("AutoExposurePass"),this.needsSwap=!1,this.mat=new t.Zg({vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:_,depthTest:!1,depthWrite:!1,uniforms:{inputBuffer:{value:null},texel:{value:new t.wq(1/64/3,1/36/3)}}}),this.fullscreenMaterial=this.mat}render(e,a){this.mat.uniforms.inputBuffer.value=a.texture,e.setRenderTarget(this.target),e.render(this.scene,this.camera),this.pending||this.frame++%((0,r.n)()?S:30)!=0||(this.pending=!0,e.readRenderTargetPixelsAsync(this.target,0,0,64,36,this.pixels).then(()=>{let e=0,a=0;for(let t=0;t<36;t++)for(let r=0;r<64;r++){let i=1+2*Math.max(0,1-2*Math.hypot(1.6*(r/63-.5),2.2*(t/35-.5)));e+=(this.pixels[(64*t+r)*4]/255-.5)*20*i,a+=i}let r=Math.pow(2,e/a);this.metered=t.rB.clamp(.2/Math.max(r,1e-4),.35,4)}).catch(()=>{}).finally(()=>{this.pending=!1}));let i=performance.now(),o=Math.min((i-this.last)/1e3,.25);this.last=i;let n=this.metered>M.auto?1.2:2.2;M.auto=t.rB.damp(M.auto,this.metered,n,o),e.toneMappingExposure=M.grade*M.bias*Math.pow(M.auto,M.strength)}dispose(){this.target.dispose(),this.mat.dispose(),super.dispose()}}e.s(["K",0,L,"r",0,M],66426)},10914,e=>{e.s(["f",0,function(t,a){return(r,i)=>(function(t,a,r,i){let o="SharedWorker"===t.name,n=e.b,l=[r.map(t=>e.h("string"==typeof t?t:t.path,n)).reverse(),e.X,n],s=["NEXT_DEPLOYMENT_ID","NEXT_CLIENT_ASSET_SUFFIX"];for(let e=0;e<s.length;e++)l.push(globalThis[s[e]]);let c=new URL(e.h(a,n),location.origin),f=JSON.stringify(l);return o?c.searchParams.set("params",f):c.hash="#params="+encodeURIComponent(f),new t(c,i?{...i,type:void 0}:void 0)})(r,t,a,i)}])}],89978,e=>{e.q("/_next/static/media/textureArrays.worker.3sdrlgr_5zs85.ts")},86998,e=>{e.v(e.r(10914).f("static/chunks/turbopack-worker-1hrsqshz0gfey.js",["static/chunks/41gcjpkr2f2ca.js","static/chunks/turbopack-44n63te-yvrsk.js","static/chunks/turbopack-3-ry682tkyiqk.js"]))}]);