import {setTimeout as delay} from 'node:timers/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export async function verifyProduction(base,expected,{request=fetch,wait=delay,attempts=15}={}) {
  const site=new URL(base);
  if(site.protocol!=='https:'||site.username||site.password||!/^[a-f0-9]{40}$/.test(expected||''))throw Error('Use HTTPS production URL and full commit SHA');
  let problem='Production verification did not complete';
  for(let attempt=0;attempt<attempts;attempt++){
    try {
      const revisionUrl=new URL('/deploy-version.json',site);
      revisionUrl.searchParams.set('verify',`${expected}-${Date.now()}`);
      const responses=await Promise.all([revisionUrl,new URL('/healthz',site)].map(url=>request(url,{headers:{'Cache-Control':'no-cache'},redirect:'error',signal:AbortSignal.timeout(5000)})));
      if(responses.some(response=>!response.ok))throw Error('Production HTTP check failed');
      const [revision,health]=await Promise.all(responses.map(response=>response.json()));
      if(revision.version!==expected)throw Error('Public site is still serving a different revision');
      if(!health.ok||!health.cloud||!health.ready)throw Error('Cloud has not reached ready state; inspect LIVE sync');
      return {ok:true,revision:expected,ready:true};
    }catch(error){problem=error.message;}
    if(attempt<attempts-1)await wait(2000);
  }
  throw Error(problem);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try {console.log(JSON.stringify(await verifyProduction(...process.argv.slice(2))));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
