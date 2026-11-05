import fs from 'node:fs';
export class AssetCache{
  constructor(limit=32*1024*1024){this.limit=limit;this.bytes=0;this.entries=new Map();}
  get(file,now=Date.now()){
    let item=this.entries.get(file);
    if(item&&now-item.checked<1000)return item;
    const stat=fs.statSync(file);if(!stat.isFile())return null;
    if(item&&item.mtime===stat.mtimeMs&&item.size===stat.size){item.checked=now;return item;}
    if(item){this.bytes-=item.body.length;this.entries.delete(file);}
    const body=fs.readFileSync(file);item={body,size:stat.size,mtime:stat.mtimeMs,checked:now,etag:`W/"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}"`};
    if(body.length<=this.limit){while(this.bytes+body.length>this.limit&&this.entries.size){const key=this.entries.keys().next().value;this.bytes-=this.entries.get(key).body.length;this.entries.delete(key);}this.entries.set(file,item);this.bytes+=body.length;}
    return item;
  }
}
