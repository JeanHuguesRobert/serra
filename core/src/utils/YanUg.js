function YanUg_svg(r) {
    const c=r*2,s=r/2,e=r*0.15,o=r*0.5,w=r*0.005,x={x1:r*0.25,y1:r*0.8,cy:r*0.95,x2:r*0.75};
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c} ${c}">
<path d="M0 ${s}A${r} ${r} 0 1 0 ${c} ${s}Z" fill="#fff"/>
<path d="M0 ${s}A${r} ${r} 0 1 1 ${c} ${s}Z" fill="#000"/>
<g stroke-width="${r*0.2}">
<circle cx="${s-o}" cy="${s}" r="${e}" fill="#000" stroke="#fff"/>
<circle cx="${s+o}" cy="${s}" r="${e}" fill="#fff" stroke="#000"/>
</g>
<circle cx="${s}" cy="${s}" r="${r-w}" fill="none" stroke="#000" stroke-width="${w}"/>
<path d="M${x.x1} ${x.y1}Q${s} ${x.cy} ${x.x2} ${x.y1}" stroke="#000" stroke-width="${r*0.05}" fill="none"/>
</svg>`;
}
