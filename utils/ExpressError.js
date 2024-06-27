class ExpressError extends Error{
    constructor(ststus,message){
        super();
        this.status=ststus;
        this.message=message;
    }
}

module.exports=ExpressError;