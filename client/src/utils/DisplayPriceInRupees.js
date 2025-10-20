export const DisplayPriceInRupees = (price)=>{
    return new Intl.NumberFormat('en-PH',{
        style : 'currency',
        currency : 'PHP'
    }).format(price)
}