// Author: CMH
// Title: Learning Shaders


#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform sampler2D u_tex3;
uniform sampler2D u_tex4;
uniform sampler2D u_tex5;
uniform sampler2D u_tex6;

float breathing=(exp(sin(u_time*2.0*3.14159/8.0)) - 0.36787944)*0.42545906412;
float mouseEffect(vec2 uv, vec2 mouse, float size)
{
    //float dist=length((uv-mouse)*2.);//
    float dist=length((mouse-uv)*1.5);
    return smoothstep(size, size+0.2*(breathing+0.5), dist);  //size
}





vec2 hash2( vec2 x )           //亂數範圍 [0,1]
{
    const vec2 k = vec2( 0.3183099*2., 0.3678794 );
    x = x*k + k.yx;
    return fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float gnoise( in vec2 p )       //亂數範圍 [0,1]
{
    vec2 i = floor( p);
    vec2 f = fract( p);   
    vec2 u = f*f*(3.0-2.0*f)*(sin(u_time*.5)*.2+1.);
    return mix( mix( dot( hash2( i*(sin(u_time*.001)*.1+1.) + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash2( i*(sin(u_time*.001)*.2+1.) + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

//hatching
float texh(in vec2 p, in float str)
{
    float rz= 1.0;
    int j=20;//20
    for (int i=0;i<20;i++){
        float pas=float(i)/float(j);
        float g = gnoise(vec2(1.*(sin(u_time*.1)*.5+1.), 80.)*p); //亂數範圍 [0,1] vec2第一個值影響寬度 .5
        g=smoothstep(0.05, 0.1, g);//0.1-0.3
        p.xy = p.yx;
        p += 0.03;
        p*= 1.2;//1.2
        rz = min(1.-g,rz);
        if ( 1.0-pas < str) break;     
    }
    return rz;
}





void main()
{
    vec2 uv= gl_FragCoord.xy/u_resolution.xy;
    vec2 vUv=fract(10.0*uv);                 //key
    vec4 shadeColor= texture2D(u_tex0, uv); //取MonaLisa
    float shading= shadeColor.g;            //取MonaLisa綠色版作為明亮值
         


    vec2 mouse=u_mouse.xy/u_resolution.xy;
    float value=mouseEffect(uv,mouse,0.05);


    

    vec3 col1=vec3(texh(uv*10.0, shading+0.6-breathing*0.1));
    vec4 c1 = vec4(col1, 1.0);

    vec3 col2=vec3(texh(uv*9.0, shading+0.5-breathing*0.2));
    vec4 c2 = vec4(col2, 1.0);

    vec3 col3=vec3(texh(uv*8.0, shading+0.4-breathing*0.3));
    vec4 c3 = vec4(col3, 1.0);

    vec3 col4=vec3(texh(uv*7.0, shading+0.3-breathing*0.4));
    vec4 c4 = vec4(col4, 1.0);

    vec3 col5=vec3(texh(uv*6.0, shading+0.2-breathing*0.5));
    vec4 c5= vec4(col5, 1.0);

    vec3 col6=vec3(texh(uv*5.0, shading+0.1-breathing*0.6));
    vec4 c6= vec4(col6, 1.0);


     




    vec4 c;      
                //兩張貼圖的權重分配
                float step = 1. / 6.;
                if( shading <= step ){   
                    c = mix( c6, c5, 6. * shading );
                }
                if( shading > step && shading <= 2. * step ){
                    c = mix( c5, c4 , 6. * ( shading - step ) );
                }
                if( shading > 2. * step && shading <= 3. * step ){
                    c = mix( c4,c3, 6. * ( shading - 2. * step ) );
                }
                if( shading > 3. * step && shading <= 4. * step ){
                    c = mix( c3, c2, 6. * ( shading - 3. * step ) );
                }
                if( shading > 4. * step && shading <= 5. * step ){
                    c = mix( c2, c1, 6. * ( shading - 4. * step ) );
                }
                if( shading > 5. * step ){
                    c = mix(c1, vec4( 1. ), 6. * ( shading - 5. * step ) );
                }
                




                
     vec4 inkColor = vec4(2.0, .45, 0.0, 1.0);
    
     vec4 src = mix( mix( inkColor, vec4(1.), c.r ), c, .5 );
    
     vec4 mixColor = mix(shadeColor, src, value);
     gl_FragColor = mixColor;
}

