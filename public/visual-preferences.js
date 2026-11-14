
export function visualPreferences(value={}){
  value=value||{};
  return {
    quality:['auto','light','balanced','high'].includes(value.quality)?value.quality:'auto',
    shake:['off','low','medium','high'].includes(value.shake)?value.shake:'low',
    motion:value.motion===true,
    flash:value.flash===true
  };
}

export function sourceVisualPreferences(params,local,shared){
  const preferences=visualPreferences(shared||local);
  const quality=params.get('quality');
  const shake=params.get('shake');
  if(['light','balanced','high'].includes(quality))preferences.quality=quality;
  if(['off','low','medium','high'].includes(shake))preferences.shake=shake;
  return preferences;
}
