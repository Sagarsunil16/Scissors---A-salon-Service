import { IStylist, IStylistDocument, PaginationOptions } from "./IStylist";

export interface IStylistRepository{
    createStylist(stylistData:Partial<IStylist>):Promise<IStylistDocument>
    findStylists(salonId:string,{page,limit}:PaginationOptions,searchTerm?:string):Promise<{stylists:IStylistDocument[],totalCount:number}>
    updateStylist(id:string,
        stylistData:Partial<IStylist>,
        options?:{populateServices?:boolean}):Promise<IStylistDocument | null>
    findStylistById(id: string): Promise<IStylistDocument | null>;
    deleteStylist(id:string):Promise<boolean>
    
    // findStylistsBySalon(salonId: string): Promise<IStylistDocument[]>;
    // updateStylist(id: string, stylistData: Partial<IStylist>): Promise<IStylistDocument | null>;
    // deleteStylist(id: string): Promise<boolean>;
}