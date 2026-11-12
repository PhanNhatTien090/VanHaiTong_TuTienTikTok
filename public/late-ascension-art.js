const skies = new Map();

export function lateRealmBackdrop(realm) {
  if(typeof Image==='undefined')return null;
  if(!skies.has(realm)){
    const image=new Image();
    image.decoding='async';
    image.src='/assets/vinh-hang-giap-v1/realm-'+realm+'-sky.webp';
    skies.set(realm,image);
  }
  const image=skies.get(realm);
  return image.complete&&image.naturalWidth?image:null;
}
