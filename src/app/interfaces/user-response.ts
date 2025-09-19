export interface userResponse{
    totalRecords:number,
    currentPage:number,
    totalPages:number,
    status:string;
    message:string;
    users:user[];
}

export interface userResponseByID{
    status:string;
    message:string;
    user:user;
}

export interface user{
    id:number;
    name:string;
    email:string;
    contact:number; 
    address:string;
}

export interface userSelectedData{
    status:string,
    message:string,
    userSelectData:user[]

}