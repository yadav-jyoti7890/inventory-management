export interface getCustomers{
    status:number;
    message:string;
    customers:customer[]

}

export interface customer{
    id:number;
    name:string;
  
}