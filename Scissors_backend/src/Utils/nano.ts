import {nanoid as nanoId} from 'nanoid'

export const nanoid = (size:number = 21):string=>{
    return nanoId(size)
}